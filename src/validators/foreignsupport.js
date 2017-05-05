import NameValidator from './name'
import AddressValidator from './address'
import { validGenericTextfield } from './helpers'

export default class ForeignActivitiesSupportValidator {
  constructor (state = {}, props = {}) {
    this.hasForeignSupport = state.HasForeignSupport
    this.list = state.List || []
  }

  validList () {
    if (this.hasForeignSupport === 'No') {
      return true
    }

    if (this.hasForeignSupport === 'Yes') {
      if (!this.list || this.list.length === 0) {
        return false
      }

      return this.list.every(item => new SupportValidator(item, null).isValid())
    }

    return false
  }

  isValid () {
    return this.validList()
  }
}

export class SupportValidator {
  constructor (state = {}, props = {}) {
    this.name = state.Name
    this.address = state.Address
    this.relationship = state.Relationship
    this.amount = state.Amount
    this.frequency = state.Frequency
    this.country = state.Country
  }

  validName () {
    return !!this.name && new NameValidator(this.name, null).isValid()
  }

  validAddress () {
    return !!this.address && new AddressValidator(this.address, null).isValid()
  }

  validRelationship () {
    return !!this.relationship && validGenericTextfield(this.relationship)
  }

  validAmount () {
    return !!this.amount && validGenericTextfield(this.amount)
  }

  validFrequency () {
    return !!this.frequency && validGenericTextfield(this.frequency)
  }

  validCountry () {
    return !!this.country && !!this.country.value && this.country.value.length > 0
  }

  isValid () {
    return this.validName() &&
      this.validAddress() &&
      this.validRelationship() &&
      this.validAmount() &&
      this.validFrequency() &&
      this.validCountry()
  }
}
