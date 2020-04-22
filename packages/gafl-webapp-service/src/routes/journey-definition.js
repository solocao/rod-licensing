import {
  LICENCE_LENGTH,
  NUMBER_OF_RODS,
  LICENCE_TO_START,
  LICENCE_START_DATE,
  LICENCE_START_TIME,
  DATE_OF_BIRTH,
  NO_LICENCE_REQUIRED,
  JUNIOR_LICENCE,
  LICENCE_TYPE,
  NAME,
  BENEFIT_CHECK,
  BENEFIT_NI_NUMBER,
  BLUE_BADGE_CHECK,
  BLUE_BADGE_NUMBER,
  ADDRESS_LOOKUP,
  ADDRESS_SELECT,
  ADDRESS_ENTRY,
  CONTACT,
  NEWSLETTER,
  SUMMARY
} from '../constants.js'

export default [
  {
    currentPage: 'start',
    nextPage: {
      ok: {
        page: LICENCE_LENGTH.uri
      }
    }
  },

  {
    currentPage: LICENCE_LENGTH.page,
    nextPage: {
      ok: {
        page: LICENCE_TYPE.uri
      }
    }
  },

  {
    currentPage: LICENCE_TYPE.page,
    nextPage: {
      troutAndCoarse: {
        page: NUMBER_OF_RODS.uri
      },
      salmonAndSeaTrout: {
        page: LICENCE_TO_START.uri
      }
    }
  },

  {
    currentPage: NUMBER_OF_RODS.page,
    nextPage: {
      ok: {
        page: LICENCE_TO_START.uri
      }
    }
  },

  {
    currentPage: LICENCE_TO_START.page,
    nextPage: {
      afterPayment: {
        page: DATE_OF_BIRTH.uri
      },
      anotherDateOrTime: {
        page: LICENCE_START_DATE.uri
      }
    }
  },

  {
    currentPage: LICENCE_START_DATE.page,
    nextPage: {
      andStartTime: {
        page: LICENCE_START_TIME.uri
      },
      andContinue: {
        page: DATE_OF_BIRTH.uri
      }
    }
  },

  {
    currentPage: LICENCE_START_TIME.page,
    nextPage: {
      ok: {
        page: DATE_OF_BIRTH.uri
      }
    }
  },

  {
    currentPage: DATE_OF_BIRTH.page,
    nextPage: {
      adult: {
        page: BENEFIT_CHECK.uri
      },
      junior: {
        page: JUNIOR_LICENCE.uri
      },
      senior: {
        page: NAME.uri
      },
      noLicenceRequired: {
        page: NO_LICENCE_REQUIRED.uri
      }
    }
  },

  {
    currentPage: JUNIOR_LICENCE.page,
    nextPage: {
      ok: {
        page: NAME.uri
      }
    }
  },

  {
    currentPage: BENEFIT_CHECK.page,
    nextPage: {
      no: {
        page: BLUE_BADGE_CHECK.uri
      },
      yes: {
        page: BENEFIT_NI_NUMBER.uri
      }
    }
  },

  {
    currentPage: BENEFIT_NI_NUMBER.page,
    nextPage: {
      ok: {
        page: NAME.uri
      }
    }
  },

  {
    currentPage: BLUE_BADGE_CHECK.page,
    nextPage: {
      no: {
        page: NAME.uri
      },
      yes: {
        page: BLUE_BADGE_NUMBER.uri
      }
    }
  },

  {
    currentPage: BENEFIT_NI_NUMBER.page,
    nextPage: {
      ok: {
        page: NAME.uri
      }
    }
  },

  {
    currentPage: BLUE_BADGE_NUMBER.page,
    nextPage: {
      ok: {
        page: NAME.uri
      }
    }
  },

  {
    currentPage: NAME.page,
    nextPage: {
      ok: {
        page: ADDRESS_LOOKUP.uri
      }
    }
  },

  {
    currentPage: ADDRESS_LOOKUP.page,
    nextPage: {
      foundSome: {
        page: ADDRESS_SELECT.uri
      },
      foundNone: {
        page: ADDRESS_ENTRY.uri
      }
    }
  },

  {
    currentPage: ADDRESS_ENTRY.page,
    nextPage: {
      ok: {
        page: CONTACT.uri
      }
    }
  },

  {
    currentPage: ADDRESS_SELECT.page,
    nextPage: {
      ok: {
        page: CONTACT.uri
      }
    }
  },

  {
    currentPage: CONTACT.page,
    nextPage: {
      yes: {
        page: NEWSLETTER.uri
      },
      no: {
        page: SUMMARY.uri
      }
    }
  },

  {
    currentPage: NEWSLETTER.page,
    nextPage: {
      ok: {
        page: SUMMARY.uri
      }
    }
  }
]