const validator = require('validator');
const isEmpty = require('./is-empty.');

module.exports = function validateProfileInput(data) {
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';

    if (!validator.isLength(data.handle, { min: 2, max: 40 })) {
        errors.handle = 'Handle needs to be between 2 and 40 characters';
    }

    if (validator.isEmpty(data.handle)) {
        errors.handle = 'Profile handle is required';
    }

    if (validator.isEmpty(data.status)) {
        errors.status = 'Status field is required';
    }

    if (validator.isEmpty(data.skills)) {
        errors.skills = 'Skills field is required';
    }

    // Validate websites

    const websites = [
        'website',
        'youtube',
        'twitter',
        'facebook',
        'linkedin',
        'instagram'
    ];

    websites.forEach(site => {
        if (!isEmpty(data[site])) {
            if (!validator.isURL(data[site])) {
                errors[site] = 'Not a valid URL';
            }
        }
    });

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
