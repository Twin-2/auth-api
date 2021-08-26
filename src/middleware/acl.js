'use strict';

module.exports = (capability) => {

  return (req, res, next) => {

    try {
      if (req.user.capabilities.includes(capability)) {
        next();
      }
      else {
        console.log('111111111111111111111111111')
        next('Access Denied');
      }
    } catch (e) {
      console.log('2222222222222222222222222222')
      next('Invalid Login');
    }

  }

}
