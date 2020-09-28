module.exports = {
    Query: {
        getUsers: () => {
            return [{
                name: 'Roy',
                email: 'roy@example.com'
            },{
                name: 'San',
                email: 'san@example.com'
            },{
                name: 'Alan',
                email: 'alan@example.com'
            }]
        }
    }
}