// @ts-check
import PocketBase from '../components/pocketbase.es.mjs'

const pb = new PocketBase(window.location.origin)

// @ts-ignore
const MHR = window.MHR
// @ts-ignore
const FV = window.FormValidator

// Copy some globals to make code less verbose
let gotoPage = MHR.gotoPage
let goHome = MHR.goHome
let storage = MHR.storage
let myerror = MHR.storage.myerror
let mylog = MHR.storage.mylog
let html = MHR.html
let cleanReload = MHR.cleanReload

// This is the home page for the Issuer.
// It needs to be served under a reverse proxy that requests TLS client authentication,
// so the browser requests to the user to select one of the certificates installed in
// the user machine.
MHR.register("OnboardingHome", class extends MHR.AbstractPage {

    /**
     * @param {string} id
     */
    constructor(id) {
        super(id)
    }

    async enter() {
        var theHtml

        // There are three possibilities:
        // 1. The authstore is valid and the email is already verified: the user is already logged in and
        // there is a valid session, so we can proceed directly to present the main Verifiable Credentials page.
        // 2. The authstrore is valid but the email lacks verification: we go to the email verification screen.
        // 3. The authstore is not valid: we go to the login/registration screen.

        gotoPage("OnboardingForm")

        // if (pb.authStore.isValid) {
        //     if (pb.authStore.model.verified) {
        //         gotoPage("ListOfferingsPage")
        //     } else {
        //         theHtml = validateEmailScreen()
        //         this.render(theHtml, false)
        //     }
        // } else {
        //     theHtml = await logonScreen()
        //     this.render(theHtml, false)
        // }

    }

})

async function logonScreen() {


    // Create and present the logon screen
    return html`
    <div>
        <style>
            me {margin:auto;max-width: 800px;}
        </style>
    
        <div class="w3-panel w3-card-2">
            <h1>Welcome</h1>

            <p>
                Before starting the onboarding process, we need to confirm your email. If this is your first time here,
                please type your company email and click the <b>Register</b> button. You will receive an email from us asking for confirmation.
            </p>

            <p>If you have already confirmed your email, just enter it and click the <b>Start onboarding</b> button.</p>

            <h3>Enter your email to start onboarding or to register</h3>

            <ion-loading id="loadingmsg" message="Processing..."></ion-loading>

            <ion-list>

                <ion-item>
                    <ion-input id="email" type="email" label="Email:"></ion-input>
                </ion-item>

            </ion-list>

            <div class="ion-margin">
                <ion-text color="danger"><p id="errortext"></p></ion-text>
    
                <ion-button id="login" @click=${()=> startOnboarding()}>
                    ${T("Start onboarding (if you are already registered)")}
                </ion-button>

                <ion-button color="secondary" @click=${()=> registerEmail()}>
                    ${T("Register (if this is the first time)")}
                </ion-button>

            </div>
        </div>
    </div>
    `
}

// registerEmail is called from the Register button in the Logon page
async function registerEmail() {
    // Clear any error message
    me("#errortext").innerText = ""

    // Get the email that the user entered
    const email = me("#email").value
    console.log("email:", email)

    if (email.length == 0) {
        console.log("email not specified")
        me("#errortext").innerText = "Enter your email"
        return
    } 

    // Prepare data to be sent to the server. The password is not used, but the server requires it
    const data = {
        "email": email,
        "emailVisibility": true,
        "password": "12345678",
        "passwordConfirm": "12345678",
    };

    // Create a record for the user
    try {
        const record = await pb.collection('users').create(data);
        console.log(record)            
    } catch (error) {
        myerror(error)
        gotoPage("ErrorPage", {title: "Error in registration", msg: error.message})
        return
    }

    // Request automatically a verification of the email
    try {
        console.log("Requesting verification")
        var result = await pb.collection('users').requestVerification(email)
        console.log("After requesting verification:", result)            
    } catch (error) {
        myerror(error)
        gotoPage("ErrorPage", {title: "Error requesting verification", msg: error.message})
        return        
    }

    alert("Registration requested. Please check your email for confirmation.")

    cleanReload()
}


function validateEmailScreen() {

    var email, verified
    if (pb.authStore.isValid) {
        email = pb.authStore.model.email
        verified = pb.authStore.model.verified
    }

    return html`
    <div>
    
        <ion-card>
            <ion-card-header>
                <ion-card-title>Welcome back ${email}</ion-card-title>
            </ion-card-header>
    
            <ion-card-content>
    
                <div class="ion-margin-top">
                    <ion-text class="ion-margin-top">You need to verify your email before being able to use this system.</ion-text>
                </div>
    
            </ion-card-content>
    
            <div class="ion-margin-start ion-margin-bottom">
                <ion-button @click=${()=> requestVerification(email)}>
                    ${T("Request verification")}
                </ion-button>
                <ion-button @click=${()=> pb.authStore.clear()}>
                    ${T("Logoff")}
                </ion-button>
            </div>
    
        </ion-card>
    </div>
    `

}

async function requestVerification(email) {

    console.log("Requesting verification")
    const result = await pb.collection('signers').requestVerification(email)
    console.log("After requesting verification:", result)

}


// logonWithEmail is called from the Logon button on the logon page
async function startOnboarding() {

    // Clear any error message
    me("#errortext").innerText = ""

    // Get the email that the user entered
    const email = me("#email").value
    console.log("email:", email)

    if (email.length == 0) {
        console.log("email not specified")
        me("#errortext").innerText = "Enter your email"
        return
    }

    // Make sure the authStore is cleared before loging in
    pb.authStore.clear()

    // Present a spinner while the server is busy
    const loader = me("#loadingmsg")
    loader.present()

    // Authenticate with the server. The password is not used, but the server requires it.
    try {
        const authData = await pb.collection('users').authWithPassword(
            email,
            "12345678",
        );
        console.log(authData)
            
    } catch (error) {
        gotoPage("ErrorPage", {title: "Error in logon", msg: error.message})
        return       
    } finally {
        loader.dismiss()
    }

    // Reload the page
    cleanReload()

}



MHR.register("LogoffPage", class extends MHR.AbstractPage {

    constructor(id) {
        super(id)
    }

    async enter() {

        console.log("AuthStore is valid:", pb.authStore.isValid)
        console.log(pb.authStore.model)
        var email, verified
        if (pb.authStore.isValid) {
            email = pb.authStore.model.email
            verified = pb.authStore.model.verified
        }

        var theHtml = html`
        <ion-card>
            <ion-card-header>
                <ion-card-title>Confirm logoff</ion-card-title>
            </ion-card-header>
    
            <ion-card-content>
    
                <div class="ion-margin-top">
                <ion-text class="ion-margin-top">Please confirm logoff.</ion-text>
                </div>
    
            </ion-card-content>
    
            <div class="ion-margin-start ion-margin-bottom">
                <ion-button @click=${() => {pb.authStore.clear();MHR.cleanReload()}}>
                    ${T("Logoff")}
                </ion-button>
            </div>
    
        </ion-card>
        `

        this.render(theHtml, false)

    }


})

MHR.register("OnboardingForm", class extends MHR.AbstractPage {

    constructor(id) {
        super(id)
    }

    async enter() {

        console.log("AuthStore is valid:", pb.authStore.isValid)
        console.log(pb.authStore.model)
        var email, verified
        if (pb.authStore.isValid) {
            email = pb.authStore.model.email
            verified = pb.authStore.model.verified
        }


        var theHtml = html`
<h3>INFORMATION FOR ONBOARDING IN DOME</h3>

<form name="theform" id="formElements">
<p><button class="w3-btn w3-black">Submit</button></p>


    <div  class="w3-panel w3-card-2">

        <div class="w3-container w3-xlarge">
            <h3>Legal representative</h3>
        </div>

        <div class="w3-row">
                
            <div class="w3-quarter w3-container">
                <p>We need information identifying the legal representative of the company who is going to sign the document.</p>
            </div>

            <div class="w3-rest w3-container">

                <div class="w3-panel w3-card-2  w3-light-grey">

                    <p><label><b>First Name</b></label>
                    <input name="LegalRepFirstName" class="w3-input w3-border" type="text" placeholder="First name"></p>


                    <p><label><b>Last Name</b></label>
                    <input name="LegalRepLastName" class="w3-input w3-border" type="text" placeholder="Last name"></p>

                    <p><label><b>Nationality</b></label>
                    <input name="LegalRepNationality" class="w3-input w3-border" type="text" placeholder="Nationality"></p>

                    <p><label><b>ID card number</b></label>
                    <input name="LegalRepIDNumber" class="w3-input w3-border" type="text" placeholder="ID card number"></p>

                </div>
            </div>
        </div>
    </div>


    <div  class="w3-panel w3-card-2">

        <div class="w3-container w3-xlarge">
            <h3>Company information</h3>
        </div>

        <div class="w3-row">

            <div class="w3-quarter w3-container">
                <p>
                    We also need information about the company so we can register it in DOME.
                </p>
                <p>
                    Make sure that the name is the legal name of the company as found in the business registry of incorporation.
                </p>
                <p>
                    We need the VAT number of your company because we use it as a unique identifier in our database. At this moment, this is not used to charge you anything.
                    Whenever in the future we provide paid services to you, a specific authorisation will be requested. 
                </p>
            </div>

            <div class="w3-rest w3-container">

                <div class="w3-panel w3-card-2  w3-light-grey">

                <p><label><b>Name</b></label>
                <input name="CompanyName" class="w3-input w3-border" type="text" placeholder="Name"></p>

                <p><label><b>Street name and number</b></label>
                <input name="CompanyStreetName" class="w3-input w3-border" type="text" placeholder="Street name and number"></p>

                <p><label><b>City</b></label>
                <input name="CompanyCity" class="w3-input w3-border" type="text" placeholder="City"></p>

                <p><label><b>Postal code</b></label>
                <input name="CompanyPostal" class="w3-input w3-border" type="text" placeholder="Postal code"></p>

                <p><label><b>Country</b></label>
                <input name="CompanyCountry" class="w3-input w3-border" type="text" placeholder="Country"></p>

                <p><label><b>VAT number</b></label>
                <input name="CompanyVATID" class="w3-input w3-border" type="text" placeholder="VAT number"></p>


                </div>
            </div>
        </div>

    </div>

    <div  class="w3-panel w3-card-2">

        <div class="w3-container w3-xlarge">
            <h3>Information about the LEAR</h3>
        </div>

        <div class="w3-row">

            <div class="w3-quarter w3-container">
                <p>
                    This section identifies an employee of the company who will act as the LEAR.
                </p>
                <p>
                    The LEAR is the Legal Entity Authorised Representative.
                    Do not confuse with the Legal Representative, who has to appear in the official records in the business registry.
                    Instead, the LEAR can be any employee who is authorised by a Legal Representative to interact with DOME and act on behalf of the company
                </p>
                <p>
                    Of course, the Legal Representative can appoint itself as the LEAR for DOME, if this is what is suitable for you.
                </p>
            </div>

            <div class="w3-rest w3-container">

                <div class="w3-panel w3-card-2  w3-light-grey">

                <p><label><b>First name</b></label>
                <input name="LEARFirstName" class="w3-input w3-border" type="text" placeholder="First name"></p>

                <p><label><b>Last name</b></label>
                <input name="LEARLastName" class="w3-input w3-border" type="text" placeholder="Last name"></p>

                <p><label><b>Nationality</b></label>
                <input name="LEARRepNationality" class="w3-input w3-border" type="text" placeholder="Nationality"></p>

                <p><label><b>ID card number</b></label>
                <input name="LEARRepIDNumber" class="w3-input w3-border" type="text" placeholder="ID card number"></p>

                <p><label><b>Email</b></label>
                <input name="LEAREmail" class="w3-input w3-border" type="text" placeholder="Email"></p>

                <p><label><b>Mobile phone</b></label>
                <input name="LEARMobilePhone" class="w3-input w3-border" type="text" placeholder="Mobile phone"></p>


                </div>
            </div>
        </div>

    </div>


</form>
`
    
        this.render(theHtml, false)

        // Define the form validation rules
        var validations = [{
            name: 'LegalRepFirstName',
            display: 'required|valid_email',
            rules: 'required'
        }, {
            name: 'LegalRepLastName',
            display: 'required',
            rules: 'required'
        }]

        // Attach the form validation rules
        var validator = new FV('theform',
            validations,
            this.createDocument);

            document.forms['theform'].elements["LegalRepFirstName"].value = "Jesus"
            document.forms['theform'].elements["LegalRepLastName"].value = "Ruiz"
            document.forms['theform'].elements["LegalRepNationality"].value = "Spanish"
            document.forms['theform'].elements["LegalRepIDNumber"].value = "24676932R"
        
    }

    async createDocument(errors, ev) {
        ev.preventDefault()
        var form = {}

        any('form input').classRemove('w3-lightred')
        any('form input').run(el => {
            if (el.value.length > 0) {
                form[el.name] = el.value
            } else {
                form[el.name] = '[' + el.name + ']'
            }})
        console.log(form)
            
        if (errors.length > 0) {
            for (var i = 0, errorLength = errors.length; i < errorLength; i++) {
                var el = errors[i].element
                console.log(el)
                me(el).classAdd("w3-lightred")
                // el.addClass("w3-red")
            }
            return
        }

        gotoPage("OnboardingDocument", form)
    }


})


MHR.register("OnboardingDocument", class extends MHR.AbstractPage {

    constructor(id) {
        super(id)
    }

    /**
     * @param {Object} form
     */
    async enter(form) {

        console.log("AuthStore is valid:", pb.authStore.isValid)
        console.log(pb.authStore.model)
        var email, verified
        if (pb.authStore.isValid) {
            email = pb.authStore.model.email
            verified = pb.authStore.model.verified
        }

        const today = new Date()
        
        var theHtml = html`

<div class="w3-panel w3-card-2">

    <h3>COMPANY DECLARATION OF HONOR</h3>

    <p>Date: ${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}</p>

    <p>
        I, the undersigned, Mr./Mrs. ${form.LegalRepFirstName} ${form.LegalRepLastName}, holding the ${form.LegalRepNationality} ID card number ${form.LegalRepIDNumber} acting for and on behalf of
    </p>

    <div>${form.CompanyName} (hereinafter, the Company)</div>
    <div>${form.CompanyStreetName}</div>
    <div>${form.CompanyCity} - ${form.CompanyPostal}</div>
    <div>${form.CompanyCountry}</div>
    <div>VAT number ${form.CompanyVATID}</div>

    <p>
    do hereby confirm that:
    </p>

    <ol>
        <li>
        The address above is correct and that I am reachable there.
        </li>
        <li>
        The information we have provided for the Company in the context of onboarding Company on the DOME Marketplace is correct and updated.
        </li>
        <li>
        That my powers of representation of the Company are in full force an effect on the date of this declaration and that of the appointment of the LEAR of Company.
        </li>
        <li>
        That my powers of representation of the Company are not limited in whichever fashion.
        </li>
        <li>
        That the Company is an actual, existing and operating entity incorporated within the European Union.
        </li>
        <li>
        That Company is not bankrupt, being wound up, having the affairs administered by the courts, entered into an arrangement with creditors, suspended business activities or subject to any other similar proceedings or procedures.
        </li>
    </ol>

    <p>
    In witness whereof, I sign this present declaration on behalf of Company on the date above.
    </p>

    <div class="w3-row">
        <div class="w3-half w3-container w3-border" style="padding-top:5px;padding-bottom:100px;padding-left:16px">
            <div>For and on behalf of Company</div>
        </div>
    </div>
    <div>
        <p>Signed: Mr./Mrs. ${form.LegalRepFirstName} ${form.LegalRepLastName}</p>
    </div>


    <p class="onlyscreen"><button class="w3-btn w3-black" @click=${()=> print()}>Print the document</button></p>


</div>

<div class="pagebreak"></div>

${await this.createLEARDocument(form)}

`
    
        this.render(theHtml, false)

    }

    /**
     * @param {Object} form
     */
    async createLEARDocument(form) {
        const today = new Date()

        var theHtml = html`

        <div class="w3-panel w3-card-2">
        
            <h3>LEAR APPOINTMENT FORM</h3>
        
            <p>Date: ${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}</p>

            <p>Subject:	designation of legal entity appointed representative (LEAR) in DOME Marketplace</p>
        
            <p>
                I, the undersigned, Mr./Mrs. ${form.LegalRepFirstName} ${form.LegalRepLastName}, holding the ${form.LegalRepNationality} ID card number ${form.LegalRepIDNumber} acting, without any kind of limitation, for and on behalf of ${form.CompanyName} (hereinafter, the Company), having its registered office at ${form.CompanyStreetName}, ${form.CompanyCity}-${form.CompanyPostal} ${form.CompanyCountry}, in my capacity of legal representative, after having read and understood the information below concerning the designation and the powers of a LEAR within the DOME Marketplace, do hereby designate as the LEAR of Company:
            </p>


            <table class="w3-table w3-border w3-bordered">
                <tr>
                    <td class="w3-border">Name and surname</td>
                    <td>${form.LEARFirstName} ${form.LEARLastName}</td>
                </tr>
                <tr>
                    <td class="w3-border">ID card number</td>
                    <td>${form.LEARRepIDNumber}</td>
                </tr>
                <tr>
                    <td class="w3-border">Postal address</td>
                    <td>Jackson</td>
                </tr>
                <tr>
                    <td class="w3-border">Email</td>
                    <td>${form.LEAREmail}</td>
                </tr>
            </table>

            <h2>ROLE AND POWERS OF THE LEAR</h2>

            <p>
            The Legal Entity Appointed Representative (hereinafter, the LEAR) is the person that any entity willing to onboard on the DOME Marketplace (hereinafter, the Marketplace) must designate to act, within the scope of the operation of the Marketplace, as the representative of the entity.
            </p>
        
            <p>
            Designating a LEAR is the first step of the onboarding process of the Marketplace.
            </p>

            <p>
            The LEAR will be responsible for providing and checking that all the information concerning the entity is accurate and remains up to date at any time.
            </p>

            <p>
            The LEAR must have all the capacity and powers to legally represent and bind your entity she/he represents for:
            </p>
            
        
            <ul>
                <li>
                Signing contracts on behalf of the entity for the sale or lease of the entity’s products and services of whatever nature;
                </li>

                <li>
                Signing contracts on behalf of the entity for the purchase of goods and services of whatever nature from third parties;
                </li>

                <li>
                Represent the entity before any other third party, be it an individual, a private entity or any public entity or public authority in any kind of proceedings, regardless of their nature (e.g., informal complaints, arbitration proceedings, jurisdictional proceedings, mediation, negotiation, administrative proceedings, etc.), either as claimant or defendant or interested party or otherwise;
                </li>

                <li>
                Accept payments in whichever form on behalf of the entity;
                </li>

                <li>
                Order payments on behalf of the entity;
                </li>

                <li>
                Make declarations on behalf of the entity, including the submission of offers or proposals (e.g., making a description of cloud or edge services in the Marketplace);
                </li>

                <li>
                Settling any complaint, claim or dispute on behalf of the entity;
                </li>

                <li>
                Delegate any of those faculties on other individuals.
                </li>

            </ul>

            <p>
            Once the LEAR is correctly registered in the Marketplace, the system will generate for her/him a verifiable credential that univocally identifies the LEAR within the Marketplace and enables her/him to digitally sign documents and perform some actions in a secure and non-repudiable fashion vis-à-vis the Marketplace.
            </p>

            <p>
            The LEAR will be entitled to delegate some of its faculties to other individuals, who will normally belong to your entity’s organisation. Those delegated persons will also have verifiable credentials enabling them to act within the Marketplace on behalf of your entity within the scope of the delegation. The delegated persons shall not be entitled to further delegated any of their powers and/or faculties.
            </p>

            <p>
            The entity shall be bound by any act or action or omission performed by the LEAR or the delegated representatives.
            </p>

            <p>
            The contract with the Marketplace must be signed by means of the verifiable credential of the LEAR or an individual vested by the LEAR with the capacity of signing contracts on behalf of the entity.
            </p>

            <p>
            The appointment of the LEAR is indefinite in time. Nonetheless, the entity can change its LEAR at any moment. Any acts, actions or omissions performed by the former LEAR will still be valid and binding on the entity represented by the LEAR.
            </p>

            <p>
            It is the responsibility of the entity to revoke the designation of an individual as LEAR or as a delegated individual vested with powers to legally bind the entity within the scope of operation of the Marketplace once the entity does not wish to be represented within the Marketplace by such individuals.
            </p>

            <p>
            In witness whereof I sign this appointment letter on the date set at the beginning of the letter.
            </p>
        
            <div class="w3-cell-row">
                <div class="w3-container w3-cell w3-border" style="width:50%">

                    <div>For and on behalf of Company</div>

                    <div class="w3-container" style="padding-bottom:100px;"></div>

                </div>

                <div class="w3-container w3-cell w3-border" style="width:50%">
                    <div>Acceptance of the appointment by the LEAR</div>

                    <div class="w3-container" style="padding-bottom:100px;"></div>

                </div>

            </div>

            <div class="w3-cell-row">
                <div class="w3-container w3-cell" style="width:50%">

                    <div>
                        <p>Signed: Mr./Mrs. ${form.LegalRepFirstName} ${form.LegalRepLastName}</p>
                    </div>

                </div>

                <div class="w3-container w3-cell" style="width:50%">

                    <div>
                        <p>Accepted and signed: Mr./Mrs. ${form.LEARFirstName} ${form.LEARLastName}</p>
                    </div>

                </div>

            </div>

        
            <p class="onlyscreen"><button class="w3-btn w3-black" @click=${()=> print()}>Print the document</button></p>
        
        
        </div>
        `

        return theHtml
        
    }


})