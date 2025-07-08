import { useState, useEffect, useCallback } from 'react'
import { encryptData, decryptData, isEncrypted, generateDataHash, verifyDataIntegrity, isValidEncryptedFormat } from '@/utils/encryption'

/**
 * Custom hook for secure localStorage operations with encryption
 * Automatically encrypts sensitive data and provides integrity verification
 */

interface SecureStorageOptions {
  encrypt?: boolean
  fallback?: unknown
  validateIntegrity?: boolean
}

export function useSecureStorage<T>(
  key: string, 
  initialValue: T, 
  options: SecureStorageOptions = {}
): [T, (value: T) => void, () => void, boolean] {
  const {
    encrypt = true,
    fallback = initialValue,
    validateIntegrity = true
  } = options

  const [value, setValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadStoredValue = () => {
      try {
        const storedValue = localStorage.getItem(key)
        if (storedValue === null) {
          setValue(initialValue)
          setIsLoading(false)
          return
        }

        let parsedValue: T
        
        if (encrypt && isEncrypted(storedValue)) {
          // Data is encrypted, validate format and decrypt it
          if (!isValidEncryptedFormat(storedValue)) {
            console.warn(`Invalid encrypted data format for ${key}, clearing corrupted data`)
            localStorage.removeItem(key)
            if (validateIntegrity) {
              localStorage.removeItem(`${key}_hash`)
            }
            setValue(fallback as T)
            setIsLoading(false)
            return
          }
          
          try {
            parsedValue = decryptData<T>(storedValue)
          } catch (error) {
            // If decryption fails (e.g., missing key, malformed UTF-8), clear the corrupted data
            console.warn(`Could not decrypt ${key}:`, error instanceof Error ? error.message : 'Unknown error')
            console.warn(`Clearing corrupted data for ${key}`)
            localStorage.removeItem(key)
            if (validateIntegrity) {
              localStorage.removeItem(`${key}_hash`)
            }
            setValue(fallback as T)
            setIsLoading(false)
            return
          }
        } else {
          // Data is not encrypted, parse normally
          parsedValue = JSON.parse(storedValue)
        }

        // Validate data integrity if enabled
        if (validateIntegrity) {
          const hashKey = `${key}_hash`
          const storedHash = localStorage.getItem(hashKey)
          
          if (storedHash && !verifyDataIntegrity(parsedValue, storedHash)) {
            console.warn(`Data integrity check failed for ${key}, using fallback`)
            setValue(fallback as T)
            setIsLoading(false)
            return
          }
        }

        setValue(parsedValue as T)
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error)
        setValue(fallback as T)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredValue()
  }, [key, initialValue, encrypt, fallback, validateIntegrity])

  // Save data to localStorage
  const setStoredValue = useCallback((newValue: T) => {
    try {
      if (encrypt) {
        // Encrypt sensitive data
        const encryptedValue = encryptData(newValue)
        localStorage.setItem(key, encryptedValue)
      } else {
        // Store as plain JSON
        localStorage.setItem(key, JSON.stringify(newValue))
      }

      // Generate and store integrity hash
      if (validateIntegrity) {
        const hash = generateDataHash(newValue)
        localStorage.setItem(`${key}_hash`, hash)
      }

      setValue(newValue)
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
      throw error
    }
  }, [key, encrypt, validateIntegrity])

  // Remove data from localStorage
  const removeStoredValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      if (validateIntegrity) {
        localStorage.removeItem(`${key}_hash`)
      }
      setValue(initialValue)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      throw error
    }
  }, [key, initialValue, validateIntegrity])

  return [value, setStoredValue, removeStoredValue, isLoading]
}

/**
 * Hook for managing multiple secure storage keys
 * Useful for bulk operations and data migration
 */
export function useSecureStorageMultiple<T extends Record<string, unknown>>(
  keys: (keyof T)[],
  initialValues: T,
  options: SecureStorageOptions = {}
): [T, (key: keyof T, value: T[keyof T]) => void, (key: keyof T) => void, boolean] {
  const [values, setValues] = useState<T>(initialValues)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAllValues = async () => {
      const loadedValues = { ...initialValues }
      
      for (const key of keys) {
        try {
          const storedValue = localStorage.getItem(key as string)
          if (storedValue !== null) {
            if (options.encrypt && isEncrypted(storedValue)) {
              if (!isValidEncryptedFormat(storedValue)) {
                console.warn(`Invalid encrypted data format for ${key as string}, using fallback`)
                localStorage.removeItem(key as string)
                loadedValues[key] = initialValues[key]
                continue
              }
              
              try {
                loadedValues[key] = decryptData(storedValue)
              } catch (decryptError) {
                console.warn(`Could not decrypt ${key as string}:`, decryptError instanceof Error ? decryptError.message : 'Unknown error')
                console.warn(`Clearing corrupted data for ${key as string}`)
                localStorage.removeItem(key as string)
                loadedValues[key] = initialValues[key]
              }
            } else {
              loadedValues[key] = JSON.parse(storedValue)
            }
          }
        } catch (error) {
          console.error(`Error loading ${key as string}:`, error)
          loadedValues[key] = initialValues[key]
        }
      }

      setValues(loadedValues)
      setIsLoading(false)
    }

    loadAllValues()
  }, [keys, initialValues, options.encrypt])

  const setStoredValue = useCallback((key: keyof T, value: T[keyof T]) => {
    try {
      if (options.encrypt) {
        localStorage.setItem(key as string, encryptData(value))
      } else {
        localStorage.setItem(key as string, JSON.stringify(value))
      }
      
      setValues(prev => ({ ...prev, [key]: value }))
    } catch (error) {
      console.error(`Error saving ${key as string}:`, error)
      throw error
    }
  }, [options.encrypt])

  const removeStoredValue = useCallback((key: keyof T) => {
    try {
      localStorage.removeItem(key as string)
      setValues(prev => ({ ...prev, [key]: initialValues[key] }))
    } catch (error) {
      console.error(`Error removing ${key as string}:`, error)
      throw error
    }
  }, [initialValues])

  return [values, setStoredValue, removeStoredValue, isLoading]
}