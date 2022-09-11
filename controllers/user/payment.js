module.exports = {
    getPaymentPage: (req, res) => {
        let user = req.cookies.user ? req.cookies.user : null;
        res.render("user/payment", {user: user})
    }
}