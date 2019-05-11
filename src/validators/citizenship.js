import _ from 'lodash'
import { validatePassport } from 'validators/passport'
import NameValidator from './name'
import LocationValidator from './location'
import { validGenericTextfield, validDateField } from './helpers'

const validCitizenships = arr => !!arr && arr.length > 0

export const validateAbroadDocumentation = ({ abroadDocumentation, explanation }) => (
  !!abroadDocumentation
    && ['FS-240', 'DS-1350', 'FS-545', 'Other'].includes(
      abroadDocumentation
    )
    && (abroadDocumentation !== 'Other'
      || (abroadDocumentation === 'Other'
        && validGenericTextfield(explanation)))
)

export const validateBornOnMilitaryInstallation = ({
  bornOnMilitaryInstallation,
  militaryBase,
}) => !!bornOnMilitaryInstallation
      && (bornOnMilitaryInstallation === 'No'
        || (bornOnMilitaryInstallation === 'Yes'
          && validGenericTextfield(militaryBase)))

export const validateDocumentation = ({
  abroadDocumentation,
  explanation,
  documentNumber,
  documentIssued,
  placeIssued,
  documentName,
}) => {
  if (abroadDocumentation === 'Other' && validateAbroadDocumentation({ abroadDocumentation, explanation })) {
    return validateAbroadDocumentation({ abroadDocumentation, explanation })
  }
  return validateAbroadDocumentation({ abroadDocumentation, explanation })
      && validGenericTextfield(documentNumber)
      && validDateField(documentIssued)
      && new LocationValidator(placeIssued).isValid()
      && new NameValidator(documentName).isValid()
}

export const validateCertificate = ({
  certificateNumber,
  certificateIssued,
  certificateName,
}) => validGenericTextfield(certificateNumber)
    && validDateField(certificateIssued)
    && new NameValidator(certificateName).isValid()

export const isCertificatePartial = ({ certificateNumber, certificateIssued, certificateName }) => {
  if (certificateNumber && !_.isEmpty(certificateNumber.value)) {
    return !validateCertificate({ certificateNumber, certificateIssued, certificateName })
  } if (certificateIssued && (
    !_.isEmpty(certificateIssued.day)
    || !_.isEmpty(certificateIssued.month)
    || !_.isEmpty(certificateIssued.year))
  ) {
    return !validateCertificate({ certificateNumber, certificateIssued, certificateName })
  } if (certificateName && (
    !_.isEmpty(certificateName.first)
    || certificateName.firstInitialOnly
    || !_.isEmpty(certificateName.middle)
    || certificateName.middleInitialOnly
    || certificateName.noMiddleName
    || !_.isEmpty(certificateName.last)
    || !_.isEmpty(certificateName.suffix))
  ) {
    return !validateCertificate({ certificateNumber, certificateIssued, certificateName })
  }
  return false
}

export const isDocumentationPartial = ({
  abroadDocumentation, explanation, documentNumber, documentIssued, placeIssued, documentName,
}) => {
  if (!_.isEmpty(abroadDocumentation)) {
    return !validateDocumentation({
      abroadDocumentation, explanation, documentNumber, documentIssued, placeIssued, documentName,
    })
  } if (explanation && !_.isEmpty(explanation.value)) {
    return !validateDocumentation({
      abroadDocumentation, explanation, documentNumber, documentIssued, placeIssued, documentName,
    })
  } if (documentNumber && !_.isEmpty(documentNumber.value)) {
    return !validateDocumentation({
      abroadDocumentation, explanation, documentNumber, documentIssued, placeIssued, documentName,
    })
  } if (documentIssued && (
    !_.isEmpty(documentIssued.day)
    || !_.isEmpty(documentIssued.month)
    || !_.isEmpty(documentIssued.year))
  ) {
    return !validateDocumentation({
      abroadDocumentation, explanation, documentNumber, documentIssued, placeIssued, documentName,
    })
  } if (documentName && (
    !_.isEmpty(documentName.first)
    || documentName.firstInitialOnly
    || !_.isEmpty(documentName.middle)
    || documentName.middleInitialOnly
    || documentName.noMiddleName
    || !_.isEmpty(documentName.last)
    || !_.isEmpty(documentName.suffix))
  ) {
    return !validateDocumentation({
      abroadDocumentation, explanation, documentNumber, documentIssued, placeIssued, documentName,
    })
  } if (!_.isEmpty(placeIssued) && (
    !_.isEmpty(placeIssued.country)
    || !_.isEmpty(placeIssued.country.value)
    || !_.isEmpty(placeIssued.city)
    || !_.isEmpty(placeIssued.state))
  ) {
    return !validateDocumentation({
      abroadDocumentation, explanation, documentNumber, documentIssued, placeIssued, documentName,
    })
  }
  return false
}

export const validateForeignBorn = (data) => {
  const { citizenshipStatus, usPassport } = data

  if (citizenshipStatus === 'ForeignBorn' && validatePassport(usPassport)) {
    return validateBornOnMilitaryInstallation(data)
  }

  if (citizenshipStatus === 'ForeignBorn') {
    return (
      (
        (!isCertificatePartial(data) && validateDocumentation(data))
        || (!isDocumentationPartial(data) && validateCertificate(data))
      )
      && validateBornOnMilitaryInstallation(data)
    )
  }
  return true
}

export const isCertificateRequired = data => (
  isCertificatePartial(data) || !validateDocumentation(data)
)

export const isDocumentRequired = data => isDocumentationPartial(data) || !validateCertificate(data)

export default class CitizenshipValidator {
  constructor(data = { Status: {}, Passport: {} }) {
    const citizenshipData = data.Status
    this.citizenshipStatus = (citizenshipData.CitizenshipStatus || {}).value
    this.abroadDocumentation = (citizenshipData.AbroadDocumentation || {}).value
    this.explanation = citizenshipData.Explanation || {}
    this.documentNumber = citizenshipData.DocumentNumber || {}
    this.documentIssued = citizenshipData.DocumentIssued
    this.documentName = citizenshipData.DocumentName
    this.documentExpiration = citizenshipData.DocumentExpiration
    this.documentType = (citizenshipData.DocumentType || {}).value
    this.placeIssued = citizenshipData.PlaceIssued
    this.certificateNumber = citizenshipData.CertificateNumber || {}
    this.certificateIssued = citizenshipData.CertificateIssued
    this.certificateName = citizenshipData.CertificateName
    this.certificateCourtName = citizenshipData.CertificateCourtName || {}
    this.certificateCourtAddress = citizenshipData.CertificateCourtAddress
    this.bornOnMilitaryInstallation = (
      citizenshipData.BornOnMilitaryInstallation || {}
    ).value
    this.militaryBase = citizenshipData.MilitaryBase || {}
    this.entryDate = citizenshipData.EntryDate
    this.entryLocation = citizenshipData.EntryLocation
    this.priorCitizenship = (citizenshipData.PriorCitizenship || {}).value
    this.hasAlienRegistration = (citizenshipData.HasAlienRegistration || {}).value
    this.alienRegistrationNumber = citizenshipData.AlienRegistrationNumber || {}
    this.alienRegistrationExpiration = citizenshipData.AlienRegistrationExpiration
    this.basis = (citizenshipData.Basis || {}).value
    this.permanentResidentCardNumber = citizenshipData.PermanentResidentCardNumber || {}
    this.residenceStatus = citizenshipData.ResidenceStatus
    this.usPassport = data.Passport
  }

  validCitizenshipStatus() {
    return (
      !!this.citizenshipStatus
      && [
        'Citizen',
        'ForeignBorn',
        'Naturalized',
        'Derived',
        'NotCitizen',
      ].includes(this.citizenshipStatus)
    )
  }

  validForeignBorn() {
    return validateForeignBorn(this)
  }

  validNaturalized() {
    if (this.citizenshipStatus !== 'Naturalized') {
      return true
    }

    return (
      validDateField(this.entryDate)
      && new LocationValidator(this.entryLocation).isValid()
      && validCitizenships(this.priorCitizenship)
      && this.validAlienRegistration()
      && validGenericTextfield(this.certificateNumber)
      && validGenericTextfield(this.certificateCourtName)
      && new LocationValidator(this.certificateCourtAddress).isValid()
      && validDateField(this.certificateIssued)
      && new NameValidator(this.certificateName).isValid()
      && this.validBasis()
    )
  }

  validDerived() {
    if (this.citizenshipStatus !== 'Derived') {
      return true
    }

    return (
      (validGenericTextfield(this.alienRegistrationNumber)
      || validGenericTextfield(this.permanentResidentCardNumber)
      || validGenericTextfield(this.certificateNumber))
      && new NameValidator(this.certificateName).isValid()
      && validDateField(this.certificateIssued)
      && this.validBasis()
    )
  }

  validNotCitizen() {
    if (this.citizenshipStatus !== 'NotCitizen') {
      return true
    }

    return (
      validGenericTextfield(this.residenceStatus)
      && validDateField(this.entryDate)
      && new LocationValidator(this.entryLocation).isValid()
      && validCitizenships(this.priorCitizenship)
      && validGenericTextfield(this.alienRegistrationNumber)
      && validDateField(this.alienRegistrationExpiration)
      && this.validDocumentType()
      && validGenericTextfield(this.documentNumber)
      && new NameValidator(this.documentName).isValid()
      && validDateField(this.documentIssued)
      && validDateField(this.documentExpiration)
    )
  }

  validAbroadDocumentation() {
    return validateAbroadDocumentation(this)
  }

  validBornOnMilitaryInstallation() {
    return validateBornOnMilitaryInstallation(this)
  }

  validAlienRegistration() {
    return (
      !!this.hasAlienRegistration
      && (this.hasAlienRegistration === 'No'
        || (this.hasAlienRegistration === 'Yes'
          && validGenericTextfield(this.alienRegistrationNumber)))
    )
  }

  validBasis() {
    return (
      !!this.basis
      && (this.basis !== 'Other'
        || (this.basis === 'Other' && validGenericTextfield(this.explanation)))
    )
  }

  validDocumentType() {
    return (
      !!this.documentType
      && ['I-94', 'U.S. Visa', 'I-20', 'DS-2019', 'Other'].includes(
        this.documentType
      )
      && (this.documentType !== 'Other'
        || (this.documentType === 'Other'
          && validGenericTextfield(this.explanation)))
    )
  }

  isValid() {
    return (
      this.validCitizenshipStatus()
      && this.validForeignBorn()
      && this.validNaturalized()
      && this.validDerived()
      && this.validNotCitizen()
    )
  }
}
