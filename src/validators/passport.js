import NameValidator from './name'
import DateRangeValidator from './daterange'
import { extractDate } from '../components/Section/History/dateranges'

const reBook = '^[a-zA-Z0-9]{9}$'

/**
 * This is for U.S. Passports
 */

const validatePassportPresence = (hasPassports) => {
  if (!hasPassports) {
    return false
  }

  if (!(hasPassports === 'No' || hasPassports === 'Yes')) {
    return false
  }

  return true
}


const validateName = (hasPassports, name) => {
  if (hasPassports === 'No') {
    return true
  }

  return new NameValidator(name).isValid()
}

const validatePassportNumber = (hasPassports, passportNumber, issuedDate) => {
  if (hasPassports === 'No') {
    return true
  }

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

const validateDates = (hasPassports, issuedDate, expirationDate) => {
  if (hasPassports === 'No') {
    return true
  }

  const range = {
    from: issuedDate,
    to: expirationDate,
    present: false,
  }
  return new DateRangeValidator(range).isValid()
}

export const validatePassport = (data = {}) => {
  const {
    Name, Number, Issued, Expiration, HasPassports,
  } = data

  const hasPassports = HasPassports.value

  return (
    validatePassportPresence(hasPassports)
    && validateName(hasPassports, Name)
    && validatePassportNumber(hasPassports, Number, Issued)
    && validateDates(hasPassports, Issued, Expiration)
  )
}
/**
 * legacy validator
 */
export default class PassportValidator {
  constructor(data = {}) {
    this.name = data.Name
    this.number = data.Number
    this.card = data.Card
    this.issued = data.Issued
    this.expiration = data.Expiration
    this.comments = data.Comments
    this.hasPassports = (data.HasPassports || {}).value
    this.card = data.Card
  }

  validHasPassports() {
    return validatePassportPresence(this.hasPassports)
  }

  validName() {
    return validateName(this.hasPassports, this.name)
  }

  validPassportNumber() {
    return validatePassportNumber(this.hasPassports, this.number, this.issued)
  }

  validDates() {
    return validateDates(this.hasPassports, this.issued, this.expiration)
  }

  isValid() {
    return (
      this.validHasPassports()
      && this.validName()
      && this.validPassportNumber()
      && this.validDates()
    )
  }
}
