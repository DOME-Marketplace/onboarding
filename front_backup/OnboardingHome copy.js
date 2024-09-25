// @ts-check
import PocketBase from '../components/pocketbase.es.mjs'

const pb = new PocketBase(window.location.origin)

// @ts-ignore
const MHR = window.MHR

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
<div>

    <form id="formElements"><div class="w3-panel w3-card-2">

        <h3>INFORMATION FOR ONBOARDING IN DOME</h3>

        <ion-grid>

            <div class="w3-panel w3-card-2">
                <ion-row>
                    <ion-col><div class="w3-panel">
                        We need information identifying the legal representative of the company who is going to sign the document.
                    </div></ion-col>

                    <ion-col size="12" size-md="8">

                        <ion-item-group>

                            <ion-item-divider>
                                <ion-label>Legal representative</ion-label>
                            </ion-item-divider>

                            <ion-item>
                                <ion-input id="LegalRepFirstName" label="First name" label-placement="stacked" required></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="LegalRepLastName" label="Last name" label-placement="stacked" required></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="LegalRepNationality" label="Nationality" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="LegalRepIDNumber" label="ID card number" label-placement="stacked"></ion-input>
                            </ion-item>

                        </ion-item-group>

                    </ion-col>
                </ion-row>
                </div>

                <div class="w3-panel w3-card-2">
                <ion-row>
                    <ion-col><div class="w3-panel">
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
                    </div></ion-col>

                    <ion-col size="12" size-md="8">

                        <ion-item-group>

                            <ion-item-divider>
                                <ion-label>Company information</ion-label>
                            </ion-item-divider>

                            <ion-item>
                                <ion-input id="CompanyName" label="Name"
                                    label-placement="stacked" required></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="CompanyStreetName" label="Street name and number" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="CompanyCity" label="City" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="CompanyPostal" label="Postal code" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="CompanyCountry" label="Country" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="CompanyVATID" label="VAT number" label-placement="stacked"></ion-input>
                            </ion-item>


                        </ion-item-group>

                    </ion-col>
                </ion-row>
                </div>


                <div class="w3-panel w3-card-2">
                <ion-row>

                    <ion-col><div class="w3-panel">
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
                    </div></ion-col>

                    <ion-col size="12" size-md="8">

                        <ion-item-group>

                            <ion-item-divider>
                                <ion-label>Information about the LEAR</ion-label>
                            </ion-item-divider>

                            <ion-item>
                                <ion-input id="LEARFirstName" label="First name" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="LEARLastName" label="Last name" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="LEARRepNationality" label="Nationality" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="LEARRepIDNumber" label="ID card number" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="LEAREmail" label="Email" label-placement="stacked"></ion-input>
                            </ion-item>

                            <ion-item>
                                <ion-input id="LEARMobilePhone" label="Mobile phone:" label-placement="stacked"></ion-input>
                            </ion-item>

                        </ion-item-group>

                    </ion-col>
                </ion-row>
            </div>

        </ion-grid>
    


    <div class="ion-margin-start ion-margin-bottom">
        <ion-button @click=${()=> this.createDocument()}>
            Generate the document
        </ion-button>
    </div>


    </div></form>
</div>


`
    
        this.render(theHtml, false)

    }

    async createDocument() {
        var elements = me("#formElements").elements
        console.log(elements)
        var form = {}

    

        form.LegalRepFirstName = me("#LegalRepFirstName").value
        form.LegalRepLastName = me("#LegalRepLastName").value
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


        var theHtml = html`

<div class="w3-panel w3-card-2">

    <h3>COMPANY DECLARATION OF HONOR</h3>

    <p>Date: [insert date in YYYY MM DD format]</p>

    <p>
        I, the undersigned, Mr./Mrs. ${form.LegalRepFirstName} ${form.LegalRepLastName}, holding the [insert country] ID card number [insert ID number] acting for and on behalf of
    </p>

    <p>
    [insert name of company] (hereinafter, the Company)
    [insert address line 1]
    [insert city and P.O. box]
    [insert country]
    VAT number [insert VAT number]
    do hereby confirm
    that:
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

    
    <div class="ion-margin-start ion-margin-bottom">
        <ion-button @click=${()=> print()}>
            Print the document
        </ion-button>
    </div>


</div>
`
    
        this.render(theHtml, false)

    }


})
