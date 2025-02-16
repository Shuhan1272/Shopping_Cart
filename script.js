
//for storing added item in cart data list 
var cart_data = [];


//fetching data from json file //products 
fetch('products_data.json')
    .then(response => response.json())
    .then(products => {
        
        if(document.body.id=="cart_page") {
            view_cart(products);
        }
        
        if(document.body.id=="product_page") {
            product_display(products);
        }
    })
    .catch(error => console.error('Error loading JSON:', error));

//load data from local storage for cart  
function load_cart_data()
{
    cart_data = JSON.parse(localStorage.getItem("cart_data")) || [];
    let cart_count = localStorage.getItem('cart_cnt') || 0;
    document.getElementById('cart_item_cnt').innerText=cart_count;
    document.getElementById('cart_item_cnt_btm').innerText=cart_count;

}

load_cart_data(); //calling load_cart_data function 

//for save cart data in local storage 
function save_cart_data()
{
    localStorage.setItem("cart_data",JSON.stringify(cart_data))
}


function update_cart_count(operation_type,amout)
{
    let cart_cnt = document.getElementById('cart_item_cnt');
    if(operation_type=='add') {
        cart_cnt.innerText = parseInt(cart_cnt.innerText)+amout;
    }
    else if(operation_type=='sub') {
        cart_cnt.innerText = parseInt(cart_cnt.innerText)-amout;
    }
    else if(operation_type=='clear') {
        cart_cnt.innerText=amout;
    }
    document.getElementById('cart_item_cnt_btm').innerText=cart_cnt.innerText;
    localStorage.setItem('cart_cnt',cart_cnt.innerText);
}

function product_display(products) {

    const product_row = document.getElementById('product_row');


    products.forEach(product => {
        const div = document.createElement('div');
        div.id=product.id; //necessary for delete 
        //div.className='col-md-3 col-sm-4 p-2'; //replace exixsting class. 
        div.classList.add('col-md-3', 'col-sm-4', 'p-2','d-flex'); //not replace existing class. 
        div.innerHTML =`
        <div class="card w-100 text-center">
            <img src=${product.img_url} class="img-fluid" alt=${product.img_url}>
            <div class="card-body">
                <h5 class="card-title fw-bolder">${product.title}</h5>
                <p class="card-text">${product.desc}</p>
                <p class="card-text fw-bold">Price : Tk ${product.price}/-</p>
                <button  class="btn btn-info" id="cart_btn_${product.id}">Add to cart</button>
                <!-- <button  class="btn btn-info" onclick='add_to_cart(${product})'>Add to cart</button> can't pass objects -->
            </div>
        </div>
        `;

        product_row.appendChild(div);

        const btn = document.getElementById(`cart_btn_${product.id}`);
        //inside onclick listener we can't pass objects 
        //btn.addEventListener("click",add_to_cart(product)); //calling before event 
        btn.addEventListener("click",() => add_to_cart(product)) //calling after event 
        
    });
    
    
}


function add_to_cart(product)
{

    //checking item is already is in cart or not 
    let cart_item= cart_data.find(data_obj => data_obj.id==product.id); //for at least one match will return true
    if(cart_item) {
        cart_item.quantity+=1;
        cart_item.total=cart_item.price*cart_item.quantity;
        do_rest();
        return ;
    }

    //if not present in cart then add in cart 
    //creating cart_data obj 
    let new_cart_item = {
        id : product.id,
        price : product.price,
        quantity : 1,
        total : product.price //initially quantity 1 and total is product price 
    }

    cart_data.push(new_cart_item);
    
    function do_rest()
    {
        show_alert('Item added successfully.','alert-success');

        //update cart count 
        update_cart_count('add',1);

        //save to local storage 
        save_cart_data();
    }
    do_rest();

}

function show_alert(alert_msg,alert_color)
{
    let alert = document.getElementById('alert');
    alert.children[0].children[0].innerText=alert_msg;
    alert.children[0].children[0].classList.add(alert_color);
    alert.classList.remove('d-none');
    setTimeout(function(){
        alert.classList.add('d-none');
    },1000)
}


function empty_cart_msg()
{
    document.getElementById('row_empt').classList.remove('d-none');
    document.getElementById('row_table').classList.add('d-none');
    document.getElementById('row_sub').classList.add('d-none');
}


function view_cart(products) {
    
    //checking cart is empty or not 
    if(cart_data.length==0) {
        empty_cart_msg();
        return ;
    }

    document.getElementById('row_table').classList.remove('d-none');
    
    //getting parent access 
    const t_body = document.getElementById('table_body');

    let serial_num = 1;
    let total_sum = 0;

    cart_data.forEach(cart_item => {
        //getting the product 
        let product = products.find(product => cart_item.id==product.id); 

        const tr = document.createElement('tr');
        tr.id = product.id; //giving id 
        
        //taking sum of total 
        total_sum += cart_item.total;
        //setting data 
        tr.innerHTML =
            `
                <th scope="row">${serial_num++}</th>
                <td><img src=${product.img_url} alt=""></td>
                <td>${product.title}</td>
                <td><span>${product.price}</span>/-</td>
                <td>
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button type="button" class="btn btn-sm btn-light" id="dec_qua_${product.id}">-</button>
                        <button type="button" class="btn btn-sm btn-light">${cart_item.quantity}</button>
                        <button type="button" class="btn btn-sm btn-light" id="inc_qua_${product.id}">+</button>
                    </div>
                </td>
                <td><span>${cart_item.total}</span>/-</td>
                <td>
                    <button type="button" class="btn" id="remove_id_${product.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
        t_body.appendChild(tr);

        document.getElementById('row_sub').classList.remove('d-none');

        //add events 
        const desc_btn = document.getElementById(`dec_qua_${product.id}`);
        const inc_btn = document.getElementById(`inc_qua_${product.id}`);
        const remove_btn = document.getElementById(`remove_id_${product.id}`);

        desc_btn.addEventListener("click", () => update_quantity('decrease', cart_item));
        inc_btn.addEventListener("click", () => update_quantity('increase', cart_item));
        remove_btn.addEventListener("click", () => remove_cart_item(cart_item));
    })

    //initial subtotal calculation 
    calculate_subtotal('add', total_sum);

}

function update_quantity(operation_type,cart_item)
{
    let tr = document.getElementById(cart_item.id);
    const quan_area = tr.children[4].children[0].children[1];
    let crnt_quantity = parseInt(quan_area.innerText);
 
    if(operation_type=='decrease') {
        if(crnt_quantity>1) {
            //decrement quantity 
            crnt_quantity -= 1;
            quan_area.innerText = crnt_quantity;
            cart_item.quantity = crnt_quantity; 
            //update cart count 
            update_cart_count('sub',1);
        }
    }
    if(operation_type=='increase') {
        //increment quantity 
        crnt_quantity += 1; 
        quan_area.innerText = crnt_quantity;
        cart_item.quantity = crnt_quantity;
        //update cart count 
        update_cart_count('add',1);
    }

    //calculate total 
    calculate_total(cart_item);

    
}

function calculate_total(cart_item)
{
    let tr = document.getElementById(cart_item.id);
    let total_area = tr.children[5].children[0]; //accessing in total area 
    let prev_total = cart_item.total; 
    let new_total = cart_item.price*cart_item.quantity;
    total_area.innerText=new_total;
    //updating total 
    cart_item.total=new_total;

    //save to local storage 
    save_cart_data();
    
    //calculate subtotal 
    let operation_type,amount;
    //on quanity increase  
    if(new_total>prev_total) {
        operation_type = 'add';
        amount = new_total - prev_total;
    }
    //on quantity decrease 
    if(prev_total>new_total) {
        operation_type = 'sub';
        amount = prev_total - new_total;
    }
    calculate_subtotal(operation_type,amount);

    
}

function calculate_subtotal(operation_type,amount)
{
    let sub_area = document.getElementById("subtotal");
    let crnt_subtotal = parseInt(sub_area.innerText);

    //add the amount 
    if(operation_type=='add') {
        crnt_subtotal+=amount;
        sub_area.innerText = crnt_subtotal;
    }
    //subtract the amount 
    if(operation_type=='sub') {
        crnt_subtotal-=amount;
        sub_area.innerText = crnt_subtotal;
    }
    //on clear cart data 
    if(operation_type=='clear') {
        sub_area.innerText = amount;
    }
    let input = document.getElementById('promo_input').value;
    if(crnt_subtotal && (input=='ostad10' || input=='ostad5')) {
        promo_apply();
    }
}

function promo_apply()
{
    let input = document.getElementById('promo_input').value;
    let subtotal=parseInt(document.getElementById('subtotal').innerText);
    let final_total_area=document.getElementById('final_total');
    let dis_amount=document.getElementById('dis_amount');
    let discount_amout,final_total;
    function calculate_dis(subtotal,percentage)
    {
        discount_amout=subtotal/100*percentage;
        final_total=subtotal-discount_amout;
    }
    if(input=='ostad10') {
        calculate_dis(subtotal,10);
    }
    else if(input=='ostad5') {
        calculate_dis(subtotal,5);
    }
    else {
        if(!input) {
            show_alert("Enter a promo code.","alert-danger");
            final_total_area.innerText=0;
            dis_amount.innerText=0;
        }
        else {
            show_alert("Invalid promo code..","alert-danger");
            final_total_area.innerText=0;
            dis_amount.innerText=0;
        }
        
        return ;
    }
    dis_amount.innerText=discount_amout;
    final_total_area.innerText=final_total;

    show_alert("Promo Code Applied.","alert-success");

}

function remove_cart_item(cart_item) 
{
    //removing from dom 
    let tr = document.getElementById(cart_item.id);
    tr.remove();

    //showing alert 
    show_alert('Item deleted successfully.','alert-danger');

    //update subtotal 
    calculate_subtotal('sub',cart_item.total);

    //update cart count 
    update_cart_count('sub',cart_item.quantity);


    //removing from storage 
    //getting index of existing product in cart_data
    const index = cart_data.findIndex(dataobj => dataobj.id == cart_item.id);
    cart_data.splice(index,1);
    
    //save to  local storage 
    save_cart_data();

    //checking cart is empty or not //msg in dom 
    if(cart_data.length==0) {
        empty_cart_msg();
    }
}

function clear_cart() {
    let modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    modal.show();

    // Handle confirmation action
    document.getElementById('confirmAction').onclick = function () {
        const t_body = document.getElementById('table_body');
        t_body.remove(); //removing from dom. 

        //clear the list 
        cart_data.length = 0;

        //update cart count 
        update_cart_count('clear', 0);

        //update subtotal 
        calculate_subtotal('clear', 0);

        //save in local storage 
        save_cart_data();

        //empty cart message in dom 
        empty_cart_msg();
        modal.hide();
    };


}

