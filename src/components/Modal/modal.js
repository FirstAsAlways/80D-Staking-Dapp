import React, { useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';

function EmailModal(props) {
    const form = useRef();
// template_rfaoawb
    const sendEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm('service_60p9474', 'template_rfaoawb', form.current, 'eg5CMT7oX74UfjEsa')
            .then((result) => {
                console.log(result);
                if(result.status == 200){
                    $('#congratulations').modal('show');
                }
               
            }, (error) => {
                console.log(error.text);
            });
    };

    return (


        <>
            <form ref={form} onSubmit={sendEmail} >
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="user_name" className="form-control" required/>
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="user_email" className="form-control" required/>
                </div>

                <div className="form-group">
                    <label>Phone</label>
                    <input type="number" name="user_phone" className="form-control" required/>
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <textarea name="user_address" className="form-control" required/>
                </div>

                <div className="form-group">
                    <label>Country</label>
                    <input type="text" name="user_country" className="form-control" required/>
                </div>

                <div className="form-group">
                    <label>Discord Username</label>
                    <input type="text" name="user_discord" className="form-control" required/>
                </div>

                <div className="form-group">
                    <label>Wallet Address</label>
                    <input type="text" name="user_wallet" className="form-control" required/>
                </div>

                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="inlineCheckbox1" required name='user_option' value="Receive at 8OD marketplace" />
                    <label className="form-check-label">Receive at 8OD marketplace
                    </label>
                </div>

                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" id="inlineCheckbox2" required name='user_option' value="Receive at home" />
                    <label className="form-check-label" >Receive at home</label>
                </div>
                <br /><br />
                <p>
                    1. when receiving at 8OD marketplace you will be able to set the price of your physical art
                    piece and the artpiece will be listed on the marketplace as soon as we receive it from
                    production. A royalty of 7.5% of the sale price will be deducted if your art piece is sold. If you
                    decide to receive it at home at a later point (without selling), you will be able to! shipping fees not
                    included. <br /><br />
                    2. when receiving at home you will get your physical art piece shipped to your address.
                    If you wish to sell it, you will have to handle the shipping to the 8OD marketplace. A royalty of 7.5% of the sale price will be deducted if your art piece is sold.
                </p>
                <br /><br />

                <input className='btn btn-primary' type="submit"  value="Submit" />
            </form>

            {/* popup Modal */}
            <div className="modal fade" id="congratulations" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Congratulations!!!</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                           <h2>Thank You</h2>
                           <p>
                            Your Order is Confirmed! <br/><br/>
                            We will contact you by email shortly! <br/><br/>
                            If you want to contact the support use the number of the NFT you claimed and contact us at 8od.blue@gmail.com
                           </p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EmailModal