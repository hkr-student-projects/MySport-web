module.exports = {
    SESSION_SECRET: process.env.SESSION_SECRET,
    MONGODB_URL: process.env.MONGODB_URL,
    SENDGRID_API: process.env.SENDGRID_API,
    BASE_URL: process.env.BASE_URL,
    EMAIL: process.env.EMAIL
};

// echo "export SENDGRID_API_KEY='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'" > sendgrid.env
// echo "sendgrid.env" >> .gitignore
// source ./sendgrid.env