import NameValidator from './name'
import DateRangeValidator from './daterange'
import { extractDate } from '../components/Section/History/dateranges'

const reBook = '^[a-zA-Z0-9]{9}$'

/**
 * This is for U.S. Passports
 */


/**
 * This validates whether the yes/no branch has been filled
 *
 */
export const validateHasPassportBranch = (hasPassports) => {
  if (!hasPassports) {
    return false
  }

  if (!(hasPassports === 'No' || hasPassports === 'Yes')) {
    return false
  }

  return true
}

/**
 * This validates if the hasPassport branch was answered "yes"
 *
 */
export const validateHasPassport = (hasPassports) => {
  if (hasPassports === 'Yes') {
    return true
  }
  return false
}

const validateName = name => (
  new NameValidator(name).isValid()
)

export const validatePassportNumber = (passportNumber, issuedDate) => {
  if (!passportNumber || !passportNumber.value) {
    return false
  }

  if (issuedDate) {
    const cutoffDate = new Date('1/1/1990 00:00')
    const issueDate = extractDate(issuedDate)

    let re = new RegExp(reBook)

    // Before 1/1/1990 allow alphanumeric of any length
    if (issueDate && issueDate < cutoffDate) {
      re = new RegExp('^[a-zA-Z0-9]*$')
      if (!re.test(passportNumber.value)) {
        return false
      }
    }

    // After 1/1/1990 enforce default regex
    if (!re.test(passportNumber.value)) {
      return false
    }
  }
  return true
}

export const validateDates = (issuedDate, expirationDate) => {
  const range = {
    from: issuedDate,
    to: expirationDate,
    present: false,
  }
  return new DateRangeValidator(range).isValid()
}

export const validatePassport = (data = {}) => {
  const {
    Name, Number, Issued, Expiration, HasPassports = {},
  } = data

  const hasPassports = HasPassports.value

  const isValid = ((passportPresence) => {
    switch (passportPresence) {
      case 'Yes':
        return (
          validateName(Name)
          && validatePassportNumber(Number, Issued)
          && validateDates(Issued, Expiration)
        )
      case 'No':
        return validateHasPassportBranch(hasPassports)
      default:
        return false
    }
  })(hasPassports)

  return isValid
}
/**
 * legacy validator
 */
export default class PassportValidator {
  constructor(data = {}) {
    this.data = data
  }

  isValid() {
    return validatePassport(this.data)
  }
}
