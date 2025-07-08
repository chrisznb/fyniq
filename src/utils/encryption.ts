import CryptoJS from 'crypto-js'

/**
 * Encryption utility for protecting sensitive data in localStorage
 * Uses AES-256-GCM encryption with browser-generated keys
 */

// Generate or retrieve encryption key
const getEncryptionKey = (): string => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    throw new Error('Encryption key can only be accessed in browser environment')
  }
  
  // First check sessionStorage for current session key
  let existingKey = sessionStorage.getItem('fyniq_enc_key')
  if (existingKey) {
    return existingKey
  }
  
  // If not in session, check localStorage for persistent key
  existingKey = localStorage.getItem('fyniq_enc_key_persistent')
  if (existingKey) {
    // Restore to sessionStorage for this session
    sessionStorage.setItem('fyniq_enc_key', existingKey)
    return existingKey
  }
  
  // Generate new key using crypto API
  const key = CryptoJS.lib.WordArray.random(256/8).toString()
  sessionStorage.setItem('fyniq_enc_key', key)
  // Also store in localStorage for persistence across sessions
  localStorage.setItem('fyniq_enc_key_persistent', key)
  return key
}

/**
 * Encrypt sensitive data before storing in localStorage
 * @param data - Data to encrypt
 * @returns Encrypted string
 */
export const encryptData = (data: unknown): string => {
  try {
    const key = getEncryptionKey()
    const dataString = JSON.stringify(data)
    const encrypted = CryptoJS.AES.encrypt(dataString, key).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt sensitive data from localStorage
 * @param encryptedData - Encrypted string to decrypt
 * @returns Decrypted data
 */
export const decryptData = <T = unknown>(encryptedData: string): T => {
  try {
    // Validate encrypted data format first
    if (!isValidEncryptedFormat(encryptedData)) {
      throw new Error('Invalid encrypted data format')
    }
    
    const key = getEncryptionKey()
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key)
    
    let decryptedString: string
    try {
      decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
    } catch {
      throw new Error('Malformed UTF-8 data - encryption key mismatch or corrupted data')
    }
    
    if (!decryptedString) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data')
    }
    
    try {
      return JSON.parse(decryptedString)
    } catch {
      throw new Error('Decrypted data is not valid JSON')
    }
  } catch (error) {
    console.error('Decryption failed:', error)
    throw error
  }
}

/**
 * Validate encrypted data format
 * @param data - Data to validate
 * @returns True if data appears to be valid encrypted format
 */
export const isValidEncryptedFormat = (data: string): boolean => {
  if (!data || typeof data !== 'string') {
    return false
  }
  
  // CryptoJS encrypted data should be base64 encoded
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Pattern.test(data) && data.length > 0
}

/**
 * Check if data is encrypted (starts with encryption marker)
 * @param data - Data to check
 * @returns True if data appears to be encrypted
 */
export const isEncrypted = (data: string): boolean => {
  try {
    // Try to parse as JSON first - if it works, it's not encrypted
    JSON.parse(data)
    return false
  } catch {
    // If JSON parsing fails, check if it's valid encrypted format
    return isValidEncryptedFormat(data)
  }
}

/**
 * Securely clear encryption key from memory
 */
export const clearEncryptionKey = (): void => {
  sessionStorage.removeItem('fyniq_enc_key')
  localStorage.removeItem('fyniq_enc_key_persistent')
}

/**
 * Generate a secure hash for data integrity verification
 * @param data - Data to hash
 * @returns SHA-256 hash
 */
export const generateDataHash = (data: unknown): string => {
  const dataString = JSON.stringify(data)
  return CryptoJS.SHA256(dataString).toString()
}

/**
 * Verify data integrity using hash comparison
 * @param data - Data to verify
 * @param expectedHash - Expected hash value
 * @returns True if data is valid
 */
export const verifyDataIntegrity = (data: unknown, expectedHash: string): boolean => {
  try {
    const currentHash = generateDataHash(data)
    return currentHash === expectedHash
  } catch (error) {
    console.error('Data integrity verification failed:', error)
    return false
  }
}

/**
 * Migrate corrupted localStorage entries by clearing them and returning default values
 * @param keys - Array of localStorage keys to check and migrate
 * @returns Object with migration results
 */
export const migrateCorruptedData = (keys: string[]): { 
  cleared: string[], 
  errors: string[] 
} => {
  const cleared: string[] = []
  const errors: string[] = []
  
  if (typeof window === 'undefined') {
    errors.push('Migration can only be run in browser environment')
    return { cleared, errors }
  }

  keys.forEach(key => {
    try {
      const storedValue = localStorage.getItem(key)
      if (storedValue) {
        // Check if it's supposed to be encrypted but format is invalid
        if (isEncrypted(storedValue) && !isValidEncryptedFormat(storedValue)) {
          localStorage.removeItem(key)
          localStorage.removeItem(`${key}_hash`)
          cleared.push(key)
        } else if (isEncrypted(storedValue)) {
          // Try to decrypt to check if it's corrupted
          try {
            decryptData(storedValue)
          } catch {
            localStorage.removeItem(key)
            localStorage.removeItem(`${key}_hash`)
            cleared.push(key)
          }
        }
      }
    } catch (error) {
      errors.push(`Error migrating ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })

  return { cleared, errors }
}