import cookies from 'react-cookies'

export default (current, action) => {
    switch (action.type) {
        case "UPDATE":
            let cart = cookies.load('cart') || null;
            let totalAmount = 0;
            let totalQuantity = 0;
            if (cart !== null) {
                for (let c of Object.values(cart)) {
                    totalQuantity += c.quantity;
                    totalAmount += c.quantity * c.price;
                }
            }

            return {
                "totalAmount": totalAmount,
                "totalQuantity": totalQuantity
            }
        case "PAID":
            cookies.remove('cart');
            return {
                "totalAmount": 0,
                "totalQuantity": 0
            }
        default:
            return current;
    }
}