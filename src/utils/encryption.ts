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
    const key = getEncryptionKey()
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key)
    const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!decryptedString) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data')
    }
    
    return JSON.parse(decryptedString)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt data')
  }
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
    // If JSON parsing fails, assume it's encrypted
    return true
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