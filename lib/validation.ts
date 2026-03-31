// Form validation utilities

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  // Allow various phone formats
  const phoneRegex = /^[\d\s\-\(\)\.+]+$/
  return phone.length === 0 || (phone.length >= 10 && phoneRegex.test(phone))
}

export const validateRequired = (value: string | number | undefined | null, fieldName: string): ValidationError | null => {
  if (value === undefined || value === null || value === '') {
    return { field: fieldName, message: `${fieldName} is required` }
  }
  return null
}

export const validateNumber = (value: string | number, fieldName: string, min?: number, max?: number): ValidationError | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) {
    return { field: fieldName, message: `${fieldName} must be a valid number` }
  }
  
  if (min !== undefined && num < min) {
    return { field: fieldName, message: `${fieldName} must be at least ${min}` }
  }
  
  if (max !== undefined && num > max) {
    return { field: fieldName, message: `${fieldName} must be at most ${max}` }
  }
  
  return null
}

export const validateJobForm = (data: {
  title: string
  clientId?: string
  status: string
}): ValidationResult => {
  const errors: ValidationError[] = []

  const titleError = validateRequired(data.title, 'Job Title')
  if (titleError) errors.push(titleError)

  if (!data.clientId) {
    errors.push({ field: 'client', message: 'Please select a client' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateClientForm = (data: {
  name: string
  email?: string
  phone?: string
}): ValidationResult => {
  const errors: ValidationError[] = []

  const nameError = validateRequired(data.name, 'Client Name')
  if (nameError) errors.push(nameError)

  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' })
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateTeamMemberForm = (data: {
  name: string
  role: string
  hourlyRate: string | number
  email?: string
  phone?: string
}): ValidationResult => {
  const errors: ValidationError[] = []

  const nameError = validateRequired(data.name, 'Name')
  if (nameError) errors.push(nameError)

  const roleError = validateRequired(data.role, 'Role')
  if (roleError) errors.push(roleError)

  const rateError = validateNumber(data.hourlyRate, 'Hourly Rate', 0)
  if (rateError) errors.push(rateError)

  if (data.email && !validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' })
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateInventoryForm = (data: {
  name: string
  quantity: string | number
  unit: string
  costPerUnit?: string | number
  lowStockThreshold?: string | number
}): ValidationResult => {
  const errors: ValidationError[] = []

  const nameError = validateRequired(data.name, 'Item Name')
  if (nameError) errors.push(nameError)

  const quantityError = validateNumber(data.quantity, 'Quantity', 0)
  if (quantityError) errors.push(quantityError)

  const unitError = validateRequired(data.unit, 'Unit')
  if (unitError) errors.push(unitError)

  if (data.costPerUnit !== undefined && data.costPerUnit !== '') {
    const costError = validateNumber(data.costPerUnit, 'Cost Per Unit', 0)
    if (costError) errors.push(costError)
  }

  if (data.lowStockThreshold !== undefined && data.lowStockThreshold !== '') {
    const thresholdError = validateNumber(data.lowStockThreshold, 'Low Stock Threshold', 0)
    if (thresholdError) errors.push(thresholdError)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateQuoteForm = (data: {
  clientName: string
  lineItems: any[]
}): ValidationResult => {
  const errors: ValidationError[] = []

  const clientError = validateRequired(data.clientName, 'Client Name')
  if (clientError) errors.push(clientError)

  if (!data.lineItems || data.lineItems.length === 0) {
    errors.push({ field: 'lineItems', message: 'Please add at least one line item' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Helper to display error messages
export const getFieldError = (errors: ValidationError[], fieldName: string): string | undefined => {
  const error = errors.find(e => e.field.toLowerCase() === fieldName.toLowerCase())
  return error?.message
}
