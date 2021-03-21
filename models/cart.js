const path = require('path');
const fs = require('fs');

const p = path.join(path.dirname(require.main.filename), 'data', 'cart.json');

class Cart {

    static async add(course){
        const cart = await this.fetch();
        
        const i = cart.courses.findIndex(c => c.id === course.id);
        if(cart.courses[i]){
            cart.courses[i].count++;
        }
        else{
            course.count = 1;
            cart.courses.push(course);
        }

        cart.price += +course.price;

        return new Promise((resolve, reject) => {
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                if(err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }

    static async remove(id) {
        const cart = await Cart.fetch();
        const i = cart.courses.findIndex(c => c.id === id);
        const course = cart.courses[i];

        if(course.count === 1){
            cart.courses = cart.courses.filter(c => c.id !== id);
        }
        else {
            cart.courses[i].count--;
        }

        cart.price -= course.price;

        return new Promise((resolve, reject) => {
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                if(err) {
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(cart);
                }
            });
        });
    }

    static async fetch(){
        return new Promise((resolve, reject) => {
            fs.readFile(p, 'utf-8', (err, data) => {
                if(err){
                    console.log(err);
                    reject(err);
                }    
                resolve(JSON.parse(data));
            });   
        });
    }
}

module.exports = Cart;