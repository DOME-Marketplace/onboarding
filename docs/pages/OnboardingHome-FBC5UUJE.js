import {
  Client
} from "../chunks/chunk-QRP43PCI.js";

// front/src/pages/OnboardingHome.js
var MHR = window.MHR;
console.log("ENVIRONMENT", window.domeEnvironment);
console.log("BUYER ONBOARDING API", window.onboardServer);
var pb = new Client(window.onboardServer);
var gotoPage = MHR.gotoPage;
var html = MHR.html;
var serverAvailable = false;
MHR.register(
  "OnboardingHome",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter() {
      try {
        const result = await fetch(window.onboardServer + "/api/health");
        console.log("Server is available:", result);
        serverAvailable = true;
      } catch (error) {
        console.log("Server is not available:", error);
        serverAvailable = false;
      }
      const logedIn = pb.authStore.isValid;
      let params = new URLSearchParams(document.location.search);
      let page = params.get("page");
      if (page == "buyer") {
        debugger;
        gotoPage("BuyerOnboardingForm", null);
        return;
      }
      if (page == "buyerotp") {
        gotoPage("BuyerOnboardingOTP", null);
        return;
      }
      if (page == "buyershow") {
        gotoPage("BuyerOnboardingShowData", null);
        return;
      }
      if (page == "login") {
        gotoPage("BuyerOnboardingLogin", null);
        return;
      }
      if (page == "verify") {
        gotoPage("BuyerOnboardingVerify", null);
        return;
      }
      gotoPage("OnboardingSelect", null);
    }
  }
);
MHR.register(
  "OnboardingSelect",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter() {
      debugger;
      let theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-container w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Please, select registration type
            </div>
            <div class="text-jumbo blinker-bold">
              as Provider or Customer of services.
            </div>
            <p class="w3-xlarge">
              The Marketplace is a digital platform that enables Cloud Service Providers (CSPs) to offer
              cloud and edge computing services to customers across Europe.
              You can register as a service provider or as a customer.
            </p>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <!-- Process structure -->
        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <div class="w3-row-padding dome-content">
            <div class="w3-half">
              <div class="w3-card-4 w3-round-large w3-white">
                <h2 class="w3-center">Customer</h2>
                <div class="w3-container">
                  <h4>Do you want to buy Cloud and Edge services?</h4>
                  <p>
                    If you are a legal entity or individual or professional acting
                    within the purpose of your trade/business/profession looking for the following benefits:
                  </p>
                  <ul>
                    <li>
                      Access the single aggregated catalogue of EU-certified
                      services
                    </li>
                    <li>
                      Enjoy a seamless experience in the procurement journey
                    </li>
                    <li>
                      Reduced time for search, comparison and evaluation
                    </li>
                    <li>
                      Simplified purchase processes and service monitoring
                    </li>
                  </ul>
                  <div class="w3-section w3-center">
                    ${serverAvailable == false ? html`
                        <div class="dome-bgcolor w3-round-large blinker-semibold">
                          <div>Temporary unavailable due to maintenance activity.</div>
                          <div>Please try again later.</div>
                        </div>
                      ` : html`
                        <button
                          class="w3-btn dome-bgcolor w3-round-large blinker-semibold"
                          title="Submit and create documents"
                          @click=${() => gotoPage("BuyerOnboardingForm", null)}
                        >
                          Become a DOME Marketplace Customer
                        </button>                    
                      `}
                  </div>
                </div>
              </div>
            </div>

            <div class="w3-half">
              <div class="w3-card-4 w3-round-large w3-white">
                <h2 class="w3-center">Provider</h2>

                <div class="w3-container">
                  <h4>Do you want to sell Cloud and Edge services?</h4>
                  <p>
                    If the answer is yes and you meet the eligibility criteria:
                  </p>
                  <ul>
                    <li>
                      You are a legal entity duly registered in an EU country.
                    </li>
                    <li>
                      You have the capability to offer cloud or edge services.
                    </li>
                    <li>
                      The target users of your offerings are other companies or
                      legal entities, public administration or professionals,
                      not consumers.
                    </li>
                  </ul>
                  <div class="w3-section w3-center">
                    <button
                      class="w3-btn dome-bgcolor w3-round-large blinker-semibold"
                      title="Submit and create documents"
                      @click=${() => gotoPage("OnboardingForm")}
                    >
                      Register as a DOME Marketplace Provider
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      `;
      this.render(theHtml, false);
    }
  }
);
MHR.register(
  "OnboardingForm",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter() {
      var theHtml = html`
    <!-- Header -->
    <div class="dome-header">
      <div class="dome-content">
        <div class="w3-bar">
          <div class="w3-bar-item padding-right-0">
            <a href="#">
              <img src="assets/logos/DOME_Icon_White.svg" alt="DOME Icon" style="width:100%;max-height:32px">
            </a>
          </div>
          <div class="w3-bar-item">
            <span class="blinker-semibold w3-xlarge nowrap">DOME MARKETPLACE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Jumbo -->
    <div class="bg-cover" style="background-image: url(assets/images/bg_1_shadow.png);">
      <div class="dome-content w3-text-white">
        <div class="text-jumbo blinker-bold w3-padding-top-48">Information for</div>
        <div class="text-jumbo blinker-bold">Onboarding in DOME Marketplace</div>
        <p class="w3-xlarge">The main goal of the onboarding process is the creation of an operating
          account for the CSPs from which they can operate within the Marketplace and start publishing their offerings.
        </p>
      </div>
      <div class="w3-padding-32"></div>
    </div>

    <div class="w3-padding-32" style="background-color: #EDF2FA;">

      <!-- Process structure -->
      <div class="w3-card-4 dome-content w3-round-large w3-white">
        <div class="w3-container">
          <h2>The process is structured in three main steps</h2>

          <div class="w3-row-padding">
            <div class="w3-third">
              <div class="parent">
                <div class="child padding-right-8">
                  <span class="material-symbols-outlined dome-color w3-xxxlarge">
                    counter_1
                  </span>
                </div>
                <div class="child padding-right-24">
                  <p>Launching of the process and provision of company information and
                    <a target="_blank" href="https://knowledgebase.dome-marketplace.eu/shelves/company-onboarding-process">required documentation</a></p>
                </div>
              </div>
            </div>
            <div class="w3-third">
              <div class="parent">
                <div class="child padding-right-8">
                  <span class="material-symbols-outlined dome-color w3-xxxlarge">
                    counter_2
                  </span>
                </div>
                <div class="child padding-right-24">
                  <p>Verification of the company documentation and contract signature</p>
                </div>
              </div>

            </div>
            <div class="w3-third">
              <div class="parent">
                <div class="child padding-right-8">
                  <span class="material-symbols-outlined dome-color w3-xxxlarge">
                    counter_3
                  </span>
                </div>
                <div class="child padding-right-24">
                  <p>Generation of the verifiable credential for the Legal Entity Appointed Representative (LEAR)</p>
                </div>
              </div>


            </div>
          </div>
          <h4>Upon the generation of the LEAR verifiable credential, the CSP account is fully operational and products and services can be published.</h4>
          <p class="w3-large">
          Please note that if you do not sign the forms below with a <b><u>digital certificate that validly identifies the natural person
          signing the forms as a representative of the company onboarding</u></b>, you will need to submit further documentation
          proving the existence of the company and the power of representation of the signatory.
          Kindly refer to the <a href="https://knowledgebase.dome-marketplace.eu/books/company-onboarding-process-guide-for-cloud-service-providers-csp/page/4-submission-and-verification-of-documentation">onboarding guidelines</a>.
          </p>

        </div>

      </div>
    </div>

    <!-- Eligibility -->
    <div class="w3-panel dome-content">
      <h1>Eligibility Verification</h1>

      <div class="w3-row">
        <div class="w3-half">
          <p class="w3-large padding-right-large">Before launching the onboarding process, make sure that you meet the
            following criteria:</p>
        </div>
        <div class="w3-half">

          <div class="w3-cell-row w3-padding-16" style="border-bottom: 1px solid #ddd">
            <div class="w3-cell w3-cell-top padding-top-small padding-right-4">
              <span class="material-symbols-outlined dome-color">
                check_circle
              </span>
            </div>
            <div class="w3-cell w3-cell-top">
              <div class="w3-xlarge blinker-semibold">You are a legal entity duly registered in an EU country</div>
            </div>
          </div>

          <div class="w3-cell-row w3-padding-16" style="border-bottom: 1px solid #ddd">
            <div class="w3-cell w3-cell-middle padding-top-small padding-right-4">
              <span class="material-symbols-outlined dome-color">
                check_circle
              </span>
            </div>
            <div class="w3-cell w3-cell-middle">
              <div class="w3-xlarge blinker-semibold">You have the capability to offer cloud or edge services</div>
            </div>
          </div>

          <div class="w3-cell-row w3-padding-16">
            <div class="w3-cell w3-cell-middle padding-top-small padding-right-4">
              <span class="material-symbols-outlined dome-color">
                check_circle
              </span>
            </div>
            <div class="w3-cell w3-cell-middle">
              <div class="w3-xlarge blinker-semibold">The target users of the offerings you publish are other companies or legal entities or professionals, not consumers</div>
            </div>
          </div>


        </div>

      </div>
    </div>

    <div class="w3-padding-32" style="background-color: #EDF2FA;">

      <!-- Instructions -->
      <div class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom">

        <div class="parent">
          <div class="child">
            <div class="w3-panel">
              <h1>Filling Out Forms</h1>
              <p class="w3-large">
                In this page you will find a form with three sections. Fill in all the fields (all of them are required),
                making sure to use Latin characters.
              </p>
              <p class="w3-large">
                The information you enter in the forms will be used to generate two of the documents required for the
                onboarding process. The whole process is described in more detail in the DOME knowledge base: Company
                Onboarding Process. You can read the description in the knowledgebase and come back here whenever you
                want.
              </p>
              <p class="w3-large">
                The forms are below. Please, click the "Submit and create documents" after filling all the fields.
              </p class="w3-large">
              <p class="w3-large">
                For testing purposes, you can click the "Fill with test data" button to create and print documents with
                test data but with the final legal prose, so they can be reviewed by your legal department in advance of
                creating the real documents.</p>
              </p>
            </div>
          </div>
          <div class="">
            <img src="assets/images/form.png" alt="DOME Icon" style="max-width:450px">
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="dome-content">
        <form name="theform" @submit=${(e) => this.validateForm(e)} id="formElements" class="w3-margin-bottom">
      
          <div class="card w3-card-2 w3-white">
      
            <div class="w3-container">
              <h1>Legal representative of the company</h1>
            </div>
      
            <div class="w3-row">
      
              <div class="w3-quarter w3-container">
                <p>We need information identifying the legal representative of the company who is going to sign the document.
                </p>
              </div>
      
              <div class="w3-rest w3-container">
      
                <div class="w3-panel w3-card-2  w3-light-grey">
      
                  <p><label><b>First Name</b></label>
                    <input name="LegalRepFirstName" class="w3-input w3-border" type="text" required>
                  </p>
      
      
                  <p><label><b>Last Name</b></label>
                    <input name="LegalRepLastName" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>Nationality</b></label>
                    <input name="LegalRepNationality" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>ID card number</b></label>
                    <input name="LegalRepIDNumber" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>Email</b></label>
                    <input name="LegalRepEmail" class="w3-input w3-border" type="text" required>
                  </p>
      
                </div>
              </div>
            </div>
          </div>
      
      
          <div class="card w3-card-2 w3-white">
      
            <div class="w3-container">
              <h1>Company information</h1>
            </div>
      
            <div class="w3-row">
      
              <div class="w3-quarter w3-container">
                <p>
                  We also need information about the company so we can register it in DOME.
                </p>
                <p>
                  Make sure that the name is the legal name of the company as found in the commercial registry or equivalent
                  institution in your jurisdiction. The address must be that of the official place of incorporation of your
                  company.
                </p>
                <p>
                  We need the VAT number of your company because we use it as a unique identifier in our database. At this
                  moment, this is not used to charge you anything. Whenever in the future we provide paid services to you, a
                  specific authorisation will be requested, and you will have to adhere to new terms of contract.
                </p>
      
              </div>
      
              <div class="w3-rest w3-container">
      
                <div class="w3-panel w3-card-2  w3-light-grey">
      
                  <p><label><b>Name</b></label>
                    <input name="CompanyName" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>Street name and number</b></label>
                    <input name="CompanyStreetName" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>City</b></label>
                    <input name="CompanyCity" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>Postal code</b></label>
                    <input name="CompanyPostal" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>Country</b></label>
                    <input name="CompanyCountry" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>VAT number</b></label>
                    <input name="CompanyVATID" class="w3-input w3-border" type="text" required>
                  </p>
      
      
                </div>
              </div>
            </div>
      
          </div>
      
          <div class="card w3-card-2 w3-white">
      
            <div class="w3-container">
              <h1>Information about the LEAR</h1>
            </div>
      
            <div class="w3-row">
      
              <div class="w3-quarter w3-container">
                <p>
                  This section identifies an employee of the company who will act as the LEAR.
                </p>
                <p>
                  The LEAR is the Legal Entity Appointed Representative. Do not confuse with the Legal Representative, who has
                  to appear in the official records in the commercial registry or equivalent institution in your jurisdiction.
                  Instead, the LEAR can be any person who is authorised by a Legal Representative to interact with DOME and
                  act on behalf of the company. There is specific information about the LEAR in the knowledge base.
                </p>
                <p>
                  Of course, the Legal Representative can appoint him/herself as the LEAR for DOME, if this is what is
                  suitable for you.
                </p>
              </div>
      
              <div class="w3-rest w3-container">
      
                <div class="w3-panel w3-card-2  w3-light-grey">
      
                  <p><label><b>First name</b></label>
                    <input name="LEARFirstName" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>Last name</b></label>
                    <input name="LEARLastName" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>Nationality</b></label>
                    <input name="LEARNationality" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>ID card number</b></label>
                    <input name="LEARIDNumber" class="w3-input w3-border" type="text" >
                  </p>
      
                  <p><label><b>Complete postal professional address</b></label>
                    <input name="LEARPostalAddress" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>Email</b></label>
                    <input name="LEAREmail" class="w3-input w3-border" type="text" required>
                  </p>
      
                  <p><label><b>Mobile phone</b></label>
                    <input name="LEARMobilePhone" class="w3-input w3-border" type="text">
                  </p>
      
      
                </div>
              </div>
            </div>
      
          </div>
      
          <div class="w3-bar w3-center">
            <button class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold" title="Submit and create documents">Submit and create documents</button>
            <button @click=${this.fillTestData} class="w3-btn dome-color border-2 w3-round-large w3-margin-left blinker-semibold">Fill with test data (only for
              testing)</button>
          </div>
      
        </form>

        <div class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom">
          <div class="w3-container">

            <p>
              Click the "<b>Submit and create documents</b>" button above to create the documents automatically including the data you entered.
            </p>
            <p>
              If you are not yet ready and want to see how the final documents look like, click the button "<b>Fill with test data</b>" and then the "<b>Submit and create documents</b>" button to create the documents with test data.
            </p>
    
          </div>

        </div>

      
      </div>
      
    </div>
    `;
      this.render(theHtml, false);
    }
    async fillTestData(ev) {
      ev.preventDefault();
      document.forms["theform"].elements["LegalRepFirstName"].value = "Jesus";
      document.forms["theform"].elements["LegalRepLastName"].value = "Ruiz";
      document.forms["theform"].elements["LegalRepNationality"].value = "Spanish";
      document.forms["theform"].elements["LegalRepIDNumber"].value = "24676932R";
      document.forms["theform"].elements["LegalRepEmail"].value = "jr@airquality.com";
      document.forms["theform"].elements["CompanyName"].value = "Air Quality Cloud";
      document.forms["theform"].elements["CompanyStreetName"].value = "C/ Academia 54";
      document.forms["theform"].elements["CompanyCity"].value = "Madrid";
      document.forms["theform"].elements["CompanyPostal"].value = "28654";
      document.forms["theform"].elements["CompanyCountry"].value = "Spain";
      document.forms["theform"].elements["CompanyVATID"].value = "B35664875";
      document.forms["theform"].elements["LEARFirstName"].value = "John";
      document.forms["theform"].elements["LEARLastName"].value = "Doe";
      document.forms["theform"].elements["LEARNationality"].value = "Spanish";
      document.forms["theform"].elements["LEARIDNumber"].value = "56332876F";
      document.forms["theform"].elements["LEARPostalAddress"].value = "C/ Academia 54, Madrid - 28654, Spain";
      document.forms["theform"].elements["LEAREmail"].value = "john.doe@airquality.com";
      document.forms["theform"].elements["LEARMobilePhone"].value = "+34876549022";
    }
    async validateForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};
      any("form input").classRemove("w3-lightred");
      any("form input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          if (el.name == "LEARIDNumber") {
            form[el.name] = "";
          } else {
            form[el.name] = "[" + el.name + "]";
          }
        }
      });
      console.log(form);
      gotoPage("OnboardingDocument", form);
    }
  }
);
MHR.register(
  "OnboardingDocument",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    /**
     * @param {Object} form
     */
    async enter(form) {
      const today = /* @__PURE__ */ new Date();
      var theHtml = html`
        <div class="onlyscreen">
          <!-- Header -->
          <div class="dome-header">
            <div class="dome-content">
              <div class="w3-bar">
                <div class="w3-bar-item padding-right-0">
                  <a href="#">
                    <img
                      src="assets/logos/DOME_Icon_White.svg"
                      alt="DOME Icon"
                      style="width:100%;max-height:32px"
                    />
                  </a>
                </div>
                <div class="w3-bar-item">
                  <span class="blinker-semibold w3-xlarge nowrap"
                    >DOME MARKETPLACE</span
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Jumbo -->
          <div
            class="bg-cover"
            style="background-image: url(assets/images/bg_1_shadow.png);"
          >
            <div class="dome-content w3-text-white">
              <div class="text-jumbo blinker-bold w3-padding-top-48">
                Prefilled Onboarding documents
              </div>
              <p class="w3-xlarge">
                The documents below have to be sent to
                <b>onboarding@dome-marketplace.eu</b> duly signed.
              </p>
            </div>
            <div class="w3-padding-16"></div>
          </div>
        </div>

        <div class="dome-content forprint">
          <!-- DOH -->
          <div id="doh" class="document w3-panel w3-card-2">
            <div class="w3-bar">
              <div class="w3-bar-item">DOME DoH for CSP</div>
              <div class="w3-bar-item w3-right">version October 2024</div>
            </div>

            <div class="w3-center">
              <h3>DOME DECLARATION OF HONOR</h3>
            </div>

            <p>
              Date:
              ${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}
            </p>

            <p>I, the undersigned,</p>

            <table class="dometable">
              <tr>
                <td>Name</td>
                <td><b>${form.LegalRepFirstName}</b></td>
              </tr>
              <tr>
                <td>Surname</td>
                <td><b>${form.LegalRepLastName}</b></td>
              </tr>
              <tr>
                <td>ID card number</td>
                <td><b>${form.LegalRepIDNumber}</b></td>
              </tr>
              <tr>
                <td>Country</td>
                <td><b>${form.LegalRepNationality}</b></td>
              </tr>
              <tr>
                <td>Email</td>
                <td><b>${form.LegalRepEmail}</b></td>
              </tr>
            </table>

            <p>acting for and on behalf of</p>

            <table class="dometable">
              <tr>
                <td>Entity full legal name</td>
                <td><b>${form.CompanyName}</b></td>
              </tr>
              <tr>
                <td>Registered office full address</td>
                <td>
                  <div><b>${form.CompanyStreetName}</b></div>
                  <div><b>${form.CompanyCity} - ${form.CompanyPostal}</b></div>
                </td>
              </tr>
              <tr>
                <td>Country of incorporation</td>
                <td><b>${form.CompanyCountry}</b></td>
              </tr>
              <tr>
                <td>Tax ID number</td>
                <td><b>${form.CompanyVATID}</b></td>
              </tr>
            </table>

            <p>(hereinafter, the Company)</p>

            <div class="w3-center">
              <p>do hereby confirm:</p>
            </div>

            <p>that:</p>

            <ol>
              <li>
                The address above is correct and that I am reachable there
              </li>
              <li>
                The information we have provided for the Company in the context
                of onboarding Company on the DOME Marketplace is correct and
                updated
              </li>
              <li>
                That my powers of representation of the Company are in full
                force an effect on the date of this declaration and that of the
                appointment of the LEAR of Company
              </li>
              <li>
                That my powers of representation of the Company are not limited
                in whichever fashion
              </li>
              <li>
                That the Company is an actual, existing and operating entity
              </li>
              <li>
                That Company is not bankrupt, being wound up, having the affairs
                administered by the courts, entered into an arrangement with
                creditors, suspended business activities or subject to any other
                similar proceedings or procedures
              </li>
            </ol>

            <div class="signature">
              <p>
                In witness whereof, I sign this present declaration on behalf of
                Company on the date above.
              </p>

              <div class="w3-row">
                <div
                  class="w3-half w3-container w3-border"
                  style="padding-top:5px;padding-bottom:100px;padding-left:16px"
                >
                  <div>For and on behalf of Company</div>
                </div>
              </div>
              <div>
                <p style="overflow-wrap: anywhere;">
                  Signed: Mr./Mrs. ${form.LegalRepFirstName}
                  ${form.LegalRepLastName}
                </p>
              </div>
            </div>
          </div>

          <div id="learappointment" class="document">
            <div class="pagebreak onlyscreen"></div>

            ${await this.createLEARDocument(form)}
          </div>

          <div class="onlyscreen">
            <div class="w3-bar w3-center">
              <button
                class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                @click=${() => this.printDocument("#doh")}
              >
                Print Declaration of Honour
              </button>
              <button
                class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                @click=${() => this.printDocument("#learappointment")}
              >
                Print LEAR appointment
              </button>
            </div>

            <div class="dome-content">
              <p>
                Click each of the buttons above to start printing the documents.
                If you want to electronically sign PDFs, you can "print to PDF"
                to save the documents in your disk and then sign them with
                whatever program you use for signing (e.g., Acrobat Reader).
              </p>
            </div>

            <div
              class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom"
            >
              <div class="w3-container">
                <h2>Next steps</h2>

                <p>
                  To complete the onboarding process in DOME, you will have to
                  submit some documentation to
                  <a href="mailto:onboarding@dome-marketplace.eu"
                    >onboarding@dome-marketplace.eu</a
                  >.
                </p>
                <p>
                  The amount of documents to submit will depend on whether your
                  company is able to electronically sign documents or not.
                </p>
                <p>
                  <b
                    >If your company has a valid qualified Digital
                    Certificate</b
                  >
                  in the sense of the eIDAS Regulation, the two documents
                  generated above are the only ones that you have to submit for
                  the onboarding process in DOME:
                </p>

                <ul>
                  <li>
                    Declaration of Honor Form: Completed and signed using the
                    qualified Digital Certificate of the company.
                  </li>

                  <li>
                    Appointment of the Legal Entity Appointed Representative
                    (LEAR) Form: Completed and signed using the qualified
                    Digital Certificate of the company.
                  </li>
                </ul>

                <p>
                  <b
                    >If your company is not able to electronically sign
                    documents</b
                  >, you have to submit additional documents,
                  <b>in addition to the two described above</b>. Please, see the
                  whole description of the onboarding process in the DOME
                  knowledgebase:
                  <a
                    href="https://knowledgebase.dome-marketplace-prd.org/shelves/company-onboarding-process"
                    >Company Onboarding Process</a
                  >.
                </p>
              </div>
            </div>

            <div class="w3-padding-48"></div>
          </div>
        </div>
      `;
      this.render(theHtml, false);
    }
    /**
     * @param {string} identifier
     */
    printDocument(identifier) {
      any(".document").classAdd("onlyscreen");
      me(identifier).classRemove("onlyscreen");
      print();
      any(".document").classRemove("onlyscreen");
    }
    /**
     * @param {Object} form
     */
    async createLEARDocument(form) {
      const today = /* @__PURE__ */ new Date();
      var theHtml = html`
        <div class="w3-panel w3-card-2">
          <div class="w3-bar">
            <div class="w3-bar-item">DOME LEAR appointment form</div>
            <div class="w3-bar-item w3-right">version February 2025</div>
          </div>

          <div class="w3-center">
            <h3>APPOINTMENT OF LEGAL ENTITY APPOINTED REPRESENTATIVE FORM</h3>
          </div>

          <div style="padding:8px;margin-bottom: 16px;border: 1px solid">
            <p>
              Before designating the Legal Entity Appointed Representative,
              please, read carefully all the document. It gives a detailed
              overview of the implications of designating a LEAR and the acts a
              LEAR can perform on behalf of your entity.
            </p>
            <p>
              Should you have any questions regarding the process or any other
              topic concerning the LEAR and the verifiable credentials generated
              by the Marketplace, please contact us at
              legal.helpdesk@dome-markeplace.org.
            </p>
            <p>
              You may also wish to read the
              <a
                href="https://knowledgebase.dome-marketplace.eu/books/company-onboarding-process-guide-for-cloud-service-providers-csp/page/practical-considerations-for-entities-on-the-appointment-of-legal-entity-appointed-representative-form"
                >Practical Considerations for Entities on the appointment of
                Legal Entity Appointed Representative Form</a
              >
              where you can find some useful additional information.
            </p>
          </div>

          <div style="padding:8px;border: 1px solid">
            <p>
              <b>NOTE</b>: you must only modify the fields where the input of
              specific information is needed. Should you modify any other
              section, sentence or portion of the document, your onboarding
              request may not be approved.
            </p>
          </div>

          <h3>LEAR APPOINTMENT FORM</h3>
          <p>
            Date:
            ${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}
          </p>

          <p>
            Subject: designation of legal entity appointed representative (LEAR)
            in DOME Marketplace
          </p>

          <p>I, the undersigned,</p>

          <table class="dometable">
            <tr>
              <td>Name</td>
              <td><b>${form.LegalRepFirstName}</b></td>
            </tr>
            <tr>
              <td>Surname</td>
              <td><b>${form.LegalRepLastName}</b></td>
            </tr>
            <tr>
              <td>ID card number</td>
              <td><b>${form.LegalRepIDNumber}</b></td>
            </tr>
            <tr>
              <td>Country</td>
              <td><b>${form.LegalRepNationality}</b></td>
            </tr>
            <tr>
              <td>Email</td>
              <td><b>${form.LegalRepEmail}</b></td>
            </tr>
          </table>

          <p>acting, as legal representative, for and on behalf of:</p>

          <table class="dometable">
            <tr>
              <td>Entity full legal name</td>
              <td><b>${form.CompanyName}</b></td>
            </tr>
            <tr>
              <td>Registered office full address</td>
              <td>
                <div><b>${form.CompanyStreetName}</b></div>
                <div><b>${form.CompanyCity} - ${form.CompanyPostal}</b></div>
              </td>
            </tr>
            <tr>
              <td>Country of incorporation<sup>1</sup></td>
              <td><b>${form.CompanyCountry}</b></td>
            </tr>
            <tr>
              <td>Tax ID number</td>
              <td><b>${form.CompanyVATID}</b></td>
            </tr>
          </table>

          <p>
            <sup>1</sup>For designating the country of incorporation, please use
            the two-letter country code. You can find such code
            <a
              href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Country_codes"
              target="_blank"
              >here</a
            >.
          </p>

          <p>(hereinafter, the Company)</p>

          <p>
            after having read and understood the information below concerning
            the designation and the powers of a LEAR within the DOME
            Marketplace, do hereby designate as the LEAR of Company:
          </p>

          <table class="dometable">
            <tr>
              <td>Name</td>
              <td><b>${form.LEARFirstName}</b></td>
            </tr>
            <tr>
              <td>Surname</td>
              <td><b>${form.LEARLastName}</b></td>
            </tr>
            <tr>
              <td>ID card number</td>
              <td><b>${form.LEARIDNumber}</b></td>
            </tr>
            <tr>
              <td>Complete postal professional address</td>
              <td><b>${form.LEARPostalAddress}</b></td>
            </tr>
            <tr>
              <td>Email</td>
              <td><b>${form.LEAREmail}</b></td>
            </tr>
          </table>

          <h3>ROLE AND POWERS OF THE LEAR</h3>

          <p>
            The Legal Entity Appointed Representative (hereinafter, the LEAR) is
            the person that any entity willing to onboard on the DOME
            Marketplace (hereinafter, the Marketplace) must designate to act,
            within the scope of the operation of the Marketplace, as the
            representative of the entity.
          </p>

          <p>
            Designating a LEAR is the first step of the onboarding process of
            the Marketplace.
          </p>

          <p>
            The LEAR will be responsible for providing and checking that all the
            information concerning the entity is accurate and remains up to date
            at any time.
          </p>

          <p>
            The LEAR must have all the capacity and powers to legally represent
            and bind the Company, for a <u>minimum</u> amount/value of each
            transaction or legal act of 100,000.00 euro (one hundred thousand
            euro), in the following transactions/legal acts:
          </p>

          <ul>
            <li>
              Signing contracts on behalf of the Company for the sale or lease
              of the entity’s products and services of whatever nature;
            </li>

            <li>
              Signing contracts on behalf of the Company for the purchase of
              goods and services of whatever nature from third parties;
            </li>

            <li>
              Represent the Company before any other third party, be it an
              individual, a private entity or any public entity or public
              authority in any kind of proceedings, regardless of their nature
              (e.g., informal complaints, arbitration proceedings,
              jurisdictional proceedings, mediation, negotiation, administrative
              proceedings, etc.), either as claimant or defendant or interested
              party or otherwise;
            </li>

            <li>Accept payments in whichever form on behalf of the Company;</li>

            <li>Order payments on behalf of the Company;</li>

            <li>
              Make declarations on behalf of the entity, including the
              submission of offers or proposals (e.g., making a description of
              cloud or edge services in the Marketplace);
            </li>

            <li>
              Settling any complaint, claim or dispute on behalf of the Company;
            </li>

            <li>Delegate any of those faculties to other individuals.</li>
          </ul>

          <p>
            Once the LEAR is correctly registered in the Marketplace, the system
            will generate for her/him a verifiable credential that univocally
            identifies the LEAR within the Marketplace and enables her/him to
            digitally sign documents and perform some actions in a secure and
            non-repudiable fashion vis-à-vis the Marketplace.
          </p>

          <p>
            The LEAR will be entitled to delegate some of its faculties to other
            individuals, who will normally belong to your Company’s
            organisation. Those delegated persons will also have verifiable
            credentials enabling them to act within the Marketplace on behalf of
            your Company within the scope of the delegation. The delegated
            persons shall not be entitled to further delegate any of their
            powers and/or faculties.
          </p>

          <p>
            The Company shall be bound by any act or omission performed by the
            LEAR or the delegated representatives.
          </p>

          <p>
            The contract with the Marketplace must be signed either by the LEAR
            or by the legal representative of the Company.
          </p>

          <p>
            The appointment of the LEAR is indefinite in time. Nonetheless, the
            Company can change its LEAR at any moment. Any acts, actions or
            omissions performed by the former LEAR will still be valid and
            binding on the Company represented by the LEAR.
          </p>

          <p>
            A single Company can appoint more than one LEAR at the same time.
          </p>

          <p>
            It is the responsibility of the Company to revoke the designation of
            an individual as LEAR or as a delegated individual vested with
            powers to legally bind the entity within the scope of operation of
            the Marketplace once the Company does not wish to be represented
            within the Marketplace by such individuals.
          </p>

          <p>
            The LEAR(s) of the Company are the people who will have to manage
            the delegation and revocation of powers to Account Operators.
          </p>

          <p>
            There can be a delay between the decision to revoke the
            representation powers of a LEAR and its actual cancellation in the
            system. Therefore, in the meantime, when revoking the appointment of
            a LEAR, the Company should take internal steps to control that the
            LEAR cannot perform any action that may cause any prejudice to your
            Company or adversely.
          </p>

          <hr />

          <div class="signature">
            <p>
              In witness whereof I sign this appointment letter on the date set
              at the beginning of the letter.
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
                  <p style="overflow-wrap: anywhere;">
                    Signed: Mr./Mrs. ${form.LegalRepFirstName}
                    ${form.LegalRepLastName}
                  </p>
                </div>
              </div>

              <div class="w3-container w3-cell" style="width:50%">
                <div>
                  <p style="overflow-wrap: anywhere;">
                    Accepted and signed: Mr./Mrs. ${form.LEARFirstName}
                    ${form.LEARLastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      return theHtml;
    }
  }
);
function loadPage(page) {
  window.location = window.location.origin + window.location.pathname + "?page=" + page;
  return;
}
MHR.register(
  "BuyerOnboardingHome",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter() {
      var theHtml;
      const logedIn = pb.authStore.isValid;
      let params = new URLSearchParams(document.location.search);
      let page = params.get("page");
      if (page == "reset") {
        pb.authStore.clear();
        gotoPage("BuyerOnboardingForm", null);
        return;
      }
      if (page == "login") {
        gotoPage("BuyerOnboardingLogin", null);
        return;
      }
      if (page == "verify") {
        gotoPage("BuyerOnboardingVerify", null);
        return;
      }
      if (page == "buyerotp") {
        gotoPage("BuyerOnboardingOTP", null);
        return;
      }
      if (logedIn && homePage == "BuyerOnboardingHome") {
        gotoPage("BuyerOnboardingShowData", null);
        return;
      }
      gotoPage("BuyerOnboardingForm", null);
      return;
    }
  }
);
MHR.register(
  "BuyerOnboardingShowData",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter(pageData) {
      debugger;
      if (!pb.authStore.isValid) {
        gotoPage("MessagePage", {
          title: "User not authenticated",
          msg: "The user has not yet authenticated"
        });
        return;
      }
      let r = pb.authStore.record;
      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-container w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Welcome to DOME Marketplace
            </div>
            <div class="text-jumbo blinker-bold">as a Buyer of services.</div>
            <p class="w3-xlarge">
              Welcome to the DOME Marketplace. This is the data for your current
              onboarding registration.
            </p>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <form
              name="theform"
              @submit=${(e) => this.validateForm(e)}
              id="formElements"
              class="w3-margin-bottom"
            >
              ${LegalRepresentativeDisplay(r)} ${CompanyDisplay(r)}
              ${LEARDisplay(r)}

              <div class="w3-bar w3-center">
                <a
                  href=${domeHome}
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  title="Go to the DOME Marketplace"
                >
                  Go to the DOME Marketplace
                </a>
              </div>
            </form>

            <div
              class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom"
            >
              <div class="w3-container">
                <p>
                  Click the "<b>Go to the DOME Marketplace</b>" button above to
                  go to the DOME Marketplace, and start buying products.
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      this.render(theHtml, false);
    }
    async fillTestData(ev) {
      ev.preventDefault();
      document.forms["theform"].elements["LegalRepCommonName"].value = "Jesus Ruiz";
      document.forms["theform"].elements["LegalRepEmail"].value = "jesus@alastria.io";
      document.forms["theform"].elements["CompanyName"].value = "Air Quality Cloud";
      document.forms["theform"].elements["CompanyStreetName"].value = "C/ Academia 54";
      document.forms["theform"].elements["CompanyCity"].value = "Madrid";
      document.forms["theform"].elements["CompanyPostal"].value = "28654";
      document.forms["theform"].elements["CompanyCountry"].value = "Spain";
      document.forms["theform"].elements["CompanyOrganizationID"].value = "VATES-B35664875";
    }
    async validateForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};
      any("form input").classRemove("w3-lightred");
      any("form input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);
      const data = {
        email: form.LegalRepEmail,
        emailVisibility: true,
        commonName: form.LegalRepCommonName,
        organization: form.CompanyName,
        street: form.CompanyStreetName,
        city: form.CompanyCity,
        postalCode: form.CompanyPostal,
        country: form.CompanyCountry,
        organizationIdentifier: form.CompanyOrganizationID,
        password: "12345678",
        passwordConfirm: "12345678"
      };
      try {
        const record = await pb.collection("buyers").create(data);
        console.log(record);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message
        });
        return;
      }
      try {
        console.log("Requesting verification");
        var result = await pb.collection("buyers").requestVerification(form.LegalRepEmail);
        console.log("After requesting verification:", result);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error requesting verification",
          msg: error.message
        });
        return;
      }
      alert(
        "Registration requested. Please check your email for confirmation."
      );
      goHome();
    }
  }
);
MHR.register(
  "BuyerOnboardingForm",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter(pageData) {
      const records = await pb.collection("tandc").getFullList({});
      debugger;
      var theHtml = html`
      <!-- Header -->
      <div class="dome-header">
        <div class="dome-content">
          <div class="w3-bar">
            <div class="w3-bar-item padding-right-0">
              <a href="#">
                <img src="assets/logos/DOME_Icon_White.svg" alt="DOME Icon" style="width:100%;max-height:32px">
              </a>
            </div>
            <div class="w3-bar-item">
              <span class="blinker-semibold w3-xlarge nowrap">DOME MARKETPLACE</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Jumbo -->
      <div class="bg-cover" style="background-image: url(assets/images/bg_1_shadow.png);">
        <div class="dome-content w3-container w3-text-white">
          <div class="text-jumbo blinker-bold w3-padding-top-48">Onboarding in DOME Marketplace</div>
          <div class="text-jumbo blinker-bold">as a Buyer of services</div>
          <p class="w3-xlarge">The main goal of this onboarding process is the creation of an operating
            account for your company so you can start looking for offerings you want to purchase from CSPs through the Marketplace.
          </p>
        </div>
        <div class="w3-padding-32"></div>
      </div>

      <div class="w3-padding-32" style="background-color: #EDF2FA;">

        <!-- Process structure -->
        <div class="w3-card-4 dome-content w3-round-large w3-white">
          <div class="w3-container">
            <h2>The process is structured in three main steps</h2>

            <div class="w3-row-padding">

              <div class="w3-third">
                <div class="parent">
                  <div class="child padding-right-8">
                    <span class="material-symbols-outlined dome-color w3-xxxlarge">
                      counter_1
                    </span>
                  </div>
                  <div class="child padding-right-24">
                    <p>Provide all the information required in the forms below and accept the terms and conditions
                      <a target="_blank"
                        href="https://knowledgebase.dome-marketplace.eu/shelves/company-onboarding-process">
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div class="w3-third">
                <div class="parent">
                  <div class="child padding-right-8">
                    <span class="material-symbols-outlined dome-color w3-xxxlarge">
                      counter_2
                    </span>
                  </div>
                  <div class="child padding-right-24">
                    <p>Verification of the email used to perform onboarding</p>
                  </div>
                </div>
              </div>

              <div class="w3-third">
                <div class="parent">
                  <div class="child padding-right-8">
                    <span class="material-symbols-outlined dome-color w3-xxxlarge">
                      counter_3
                    </span>
                  </div>
                  <div class="child padding-right-24">
                    <p>Generation of the verifiable credential for the Legal Entity Appointed Representative (LEAR)</p>
                  </div>
                </div>
              </div>

            </div>

            <h4>Upon the generation of the LEAR verifiable credential,
              the company account is fully operational and can be used to buy/contract services in the Marketplace
            </h4>
          </div>

        </div>
      </div>

      <!-- Eligibility -->
      <div class="w3-panel dome-content">
        <h1>Eligibility Verification</h1>

        <div class="w3-row">
            <p class="w3-xlarge padding-right-large blinker-semibold">
              You are a company or an individual who is acting for purposes within your trade, business and profession
            </p>
        </div>
      </div>

      <div class="w3-padding-32" style="background-color: #EDF2FA;">

        <!-- Instructions -->
        <div class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom">

          <div class="parent">
            <div class="child">
              <div class="w3-panel">
                <h1>Filling Out Forms</h1>
                <p class="w3-large">
                  In this page you will find a form with three sections. Fill in all the fields 
                  (unless marked as optional), making sure to use Latin characters.
                </p>
                <p class="w3-large">
                  The information you enter in the forms will be used for the registration of your company
                  in the DOME Marketplace.
                  The whole process is described in more detail in the DOME knowledge base: Buyer
                  Onboarding Process. You can read the description in the knowledgebase and come back here whenever you
                  want.
                </p>
                <p class="w3-large">
                  The forms are below. Please, click the "Start registration" button after filling all the fields.
                </p class="w3-large">
              </div>
            </div>
            <div class="">
              <img src="assets/images/form.png" alt="DOME Icon" style="max-width:450px">
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="dome-content">
          <form
          name="buyer_onboarding_form"
          id="buyer_onboarding_form"
          @submit=${(ev) => this.submitForm(ev)}
          class="w3-margin-bottom"
          >

            ${LegalRepresentativeForm()}

            ${TermsAndConditionsForm(records)}

            ${CompanyForm()}

            ${LEARForm()}

            <div class="w3-bar w3-center">
              <button class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                title="Submit and create documents">Start registration
              </button>
              <a @click=${this.fillTestData}
                class="w3-btn dome-color border-2 w3-round-large w3-margin-left blinker-semibold">
                Fill with test data (only for testing)
              </a>
            </div>

          </form>

          <div class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom">
            <div class="w3-container">

              <p>
                Click the "<b>Start registration</b>" button above to start the registration.
              </p>
              <p>
                After submission, you will see a confirmation screen where you have to enter the one-time
                code that you will receive in your email inbox.
              </p>

            </div>

          </div>


        </div>

      </div>
      `;
      this.render(theHtml, false);
    }
    async fillTestData(ev) {
      ev.preventDefault();
      document.forms["buyer_onboarding_form"].elements["LegalRepCommonName"].value = "Jesus Ruiz";
      document.forms["buyer_onboarding_form"].elements["LegalRepEmail"].value = "jesus@alastria.io";
      document.forms["buyer_onboarding_form"].elements["CompanyName"].value = "Air Quality Cloud";
      document.forms["buyer_onboarding_form"].elements["CompanyStreetName"].value = "C/ Academia 54";
      document.forms["buyer_onboarding_form"].elements["CompanyCity"].value = "Madrid";
      document.forms["buyer_onboarding_form"].elements["CompanyPostal"].value = "28654";
      document.forms["buyer_onboarding_form"].elements["CompanyCountry"].value = "ES";
      document.forms["buyer_onboarding_form"].elements["CompanyOrganizationID"].value = "VATES-B35664875";
      document.forms["buyer_onboarding_form"].elements["LEARFirstName"].value = "John";
      document.forms["buyer_onboarding_form"].elements["LEARLastName"].value = "Doe";
      document.forms["buyer_onboarding_form"].elements["LEARNationality"].value = "Spanish";
      document.forms["buyer_onboarding_form"].elements["LEARIDNumber"].value = "56332876F";
      document.forms["buyer_onboarding_form"].elements["LEARPostalAddress"].value = "C/ Academia 54, Madrid - 28654, Spain";
      document.forms["buyer_onboarding_form"].elements["LEAREmail"].value = "john.doe@airquality.com";
      document.forms["buyer_onboarding_form"].elements["LEARMobilePhone"].value = "+34876549022";
    }
    async submitForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};
      any("#buyer_onboarding_form input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[N/A]";
        }
      });
      form.CompanyCountry = me("#buyerCompanyCountry").value;
      console.log(form);
      const data = {
        email: form.LegalRepEmail,
        emailVisibility: true,
        name: form.LegalRepCommonName,
        organizationIdentifier: form.CompanyOrganizationID,
        organization: form.CompanyName,
        street: form.CompanyStreetName,
        city: form.CompanyCity,
        postalCode: form.CompanyPostal,
        country: form.CompanyCountry,
        learFirstName: form.LEARFirstName,
        learLastName: form.LEARLastName,
        learNationality: form.LEARNationality,
        learIdcard: form.LEARIDNumber,
        learStreet: form.LEARPostalAddress,
        learEmail: form.LEAREmail,
        learMobile: form.LEARMobilePhone,
        password: "12345678",
        passwordConfirm: "12345678"
      };
      try {
        const record = await pb.collection("buyers").create(data);
        console.log(record);
      } catch (error) {
        myerror(error);
        if (error.response?.data?.organizationIdentifier?.code == "validation_not_unique") {
          gotoPage("MessagePage", {
            title: "Error in registration",
            msg: "The organization is already registered",
            details: "If you want to modify your registration data, or have any doubts, please contact us at onboarding@dome-marketplace.eu",
            level: "info"
          });
          return;
        }
        gotoPage("MessagePage", {
          title: "Error in registration",
          msg: error.message
        });
        return;
      }
      try {
        const record = await pb.collection("buyers").requestOTP(form.LegalRepEmail);
        console.log(record);
        localStorage.setItem("buyerEmail", form.LegalRepEmail);
        localStorage.setItem("buyerOtpId", record.otpId);
        loadPage("buyerotp");
        return;
      } catch (error) {
        myerror(error);
        gotoPage("MessagePage", {
          title: "Error in registration",
          msg: error.message
        });
        return;
      }
    }
  }
);
function LegalRepresentativeForm() {
  return html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Person driving the onboarding process</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>
            We need information identifying the person performing the onboarding
            process on behalf of the company.
          </p>
          <p>
            Your email will be used to receive important messages from us. After
            submitting the form, you will receive a message for confirmation.
          </p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>Name and surname</b></label>
              <input
                name="LegalRepCommonName"
                class="w3-input w3-border"
                type="text"
                required
              />
            </p>

            <p>
              <label><b>Email</b></label>
              <input
                name="LegalRepEmail"
                class="w3-input w3-border"
                type="text"
                required
              />
            </p>

            <p>
              <b>IMPORTANT:</b> your onboarding request can only be processed
              after you confirm your email address. After you submit the
              onboarding request, you will receive a message from us at the
              email address you specify here, allowing you to confirm it.
            </p>
            <p>
              We send the email immediately, but depending on the email server
              configuration, you may require some minutes before receiving the
              message. Also, if you do not receive the email in a reasonable
              time, please look in your spam inbox, just in case your email
              server has clasified it as such.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
function TermsAndConditionsForm(records) {
  return html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Accept Terms and Conditions</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>We need the company to accept the DOME Terms and Conditions.</p>
          <p>
            Please, read the linked documents and click on the checkbox to
            accept the conditions described in them.
          </p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            ${records.map((element) => {
    debugger;
    let name = element.name;
    let fileName = element.file;
    let description = element.description;
    let url = pb.files.getURL(element, fileName);
    return html`
                <p>
                  <a href=${url}>${description}</a>
                </p>
              `;
  })}
            <p>
              <input
                class="w3-check"
                type="checkbox"
                name="TermsAndConditions"
                required
              />
              <label>I have read and accept the DOME terms and conditions and the DOME Marketplace privacy policy</label>
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
function LegalRepresentativeDisplay(r) {
  return html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Person performing onboarding</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>This is the information we have about you.</p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>Name and surname</b></label>
              <input
                name="LegalRepCommonName"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.name : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Email</b></label>
              <input
                name="LegalRepEmail"
                class="w3-input w3-border"
                type="text"
                placeholder="Email"
                value=${r ? r.email : null}
                ?readonly=${r}
                disabled
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}
function CompanyDisplay(r) {
  var theHtml = html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Company information</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>This is the information about the company.</p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>Official name</b></label>
              <input
                name="CompanyName"
                class="w3-input w3-border"
                type="text"
                placeholder="Name"
                value=${r ? r.organization : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Street name and number</b></label>
              <input
                name="CompanyStreetName"
                class="w3-input w3-border"
                type="text"
                placeholder="Street name and number"
                value=${r ? r.street : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>City</b></label>
              <input
                name="CompanyCity"
                class="w3-input w3-border"
                type="text"
                placeholder="City"
                value=${r ? r.city : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Postal code</b></label>
              <input
                name="CompanyPostal"
                class="w3-input w3-border"
                type="text"
                placeholder="Postal code"
                value=${r ? r.postalCode : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Country</b></label>
              <input
                name="CompanyCountry"
                class="w3-input w3-border"
                type="text"
                placeholder="Country"
                value=${r ? r.country : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Tax identifier</b></label>
              <input
                name="CompanyOrganizationID"
                class="w3-input w3-border"
                type="text"
                placeholder="VAT number"
                value=${r ? r.organizationIdentifier : null}
                ?readonly=${r}
                disabled
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
  return theHtml;
}
function LEARDisplay(r) {
  var theHtml = html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Information about the LEAR</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>
            This is the information about the LEAR, identifying the employee of
            the company who will act as the Legal Entity Authorised
            Representative.
          </p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>First name</b></label>
              <input
                name="LEARFirstName"
                class="w3-input w3-border"
                type="text"
                placeholder="First name"
                value=${r ? r.learFirstName : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Last name</b></label>
              <input
                name="LEARLastName"
                class="w3-input w3-border"
                type="text"
                placeholder="Last name"
                value=${r ? r.learLastName : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Nationality</b></label>
              <input
                name="LEARNationality"
                class="w3-input w3-border"
                type="text"
                placeholder="Nationality"
                value=${r ? r.learNationality : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>ID card number</b></label>
              <input
                name="LEARIDNumber"
                class="w3-input w3-border"
                type="text"
                placeholder="ID card number"
                value=${r ? r.learIdcard : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Complete postal professional address</b></label>
              <input
                name="LEARPostalAddress"
                class="w3-input w3-border"
                type="text"
                placeholder="Complete postal professional address"
                value=${r ? r.learStreet : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Email</b></label>
              <input
                name="LEAREmail"
                class="w3-input w3-border"
                type="text"
                placeholder="Email"
                value=${r ? r.learEmail : null}
                ?readonly=${r}
                disabled
              />
            </p>

            <p>
              <label><b>Mobile phone</b></label>
              <input
                name="LEARMobilePhone"
                class="w3-input w3-border"
                type="text"
                placeholder="Mobile phone"
                value=${r ? r.learMobile : null}
                ?readonly=${r}
                disabled
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
  return theHtml;
}
function CompanyForm(r) {
  var theHtml = html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Company information</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>
            We also need information about the company so we can register it in
            DOME.
          </p>
          <p>
            The name must be the official name of the company as it appears in
            the records of incorporation of your company. The address must be
            that of the official place of incorporation of your company.
          </p>
          <p>
            The Tax identifier will be used as a unique identifier of your
            company in the DOME Marketplace, and also when you buy services
            published in the marketplace.
          </p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>Official name</b></label>
              <input
                name="CompanyName"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.organization : null}
                ?readonly=${r}
                required
              />
            </p>

            <p>
              <label><b>Street name and number</b></label>
              <input
                name="CompanyStreetName"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.street : null}
                ?readonly=${r}
                required
              />
            </p>

            <p>
              <label><b>City</b></label>
              <input
                name="CompanyCity"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.city : null}
                ?readonly=${r}
                required
              />
            </p>

            <p>
              <label><b>Postal code</b></label>
              <input
                name="CompanyPostal"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.postalCode : null}
                ?readonly=${r}
                required
              />
            </p>

            <p>
              <label><b>Country</b></label>
              <select id="buyerCompanyCountry" class="w3-select w3-border" name="CompanyCountry" required value=${r ? r.postalCode : null} ?readonly=${r}>
                <option value="" disabled selected>Choose the country</option>
                <option value="AT">Austria</option>
                <option value="BE">Belgium</option>
                <option value="BG">Bulgaria</option>
                <option value="HR">Croatia</option>
                <option value="CY">Cyprus</option>
                <option value="CZ">Czech Republic</option>
                <option value="DK">Denmark</option>
                <option value="EE">Estonia</option>
                <option value="FI">Finland</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="EL">Greece</option>
                <option value="HU">Hungary</option>
                <option value="IS">Iceland</option>
                <option value="IE">Ireland</option>
                <option value="IT">Italy</option>
                <option value="LV">Latvia</option>
                <option value="LI">Liechtenstein</option>
                <option value="LT">Lithuania</option>
                <option value="LU">Luxembourg</option>
                <option value="MT">Malta</option>
                <option value="NL">Netherlands</option>
                <option value="NO">Norway</option>
                <option value="PL">Poland</option>
                <option value="PT">Portugal</option>
                <option value="RO">Romania</option>
                <option value="SK">Slovakia</option>
                <option value="SI">Slovenia</option>
                <option value="ES">Spain</option>
                <option value="SE">Sweden</option>
              </select>
            </p>

            <p>
              <label><b>Tax identifier</b></label>
              <input
                name="CompanyOrganizationID"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.organizationIdentifier : null}
                ?readonly=${r}
                required
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
  return theHtml;
}
function LEARForm(r) {
  var theHtml = html`
    <div class="card w3-card-2 w3-white">
      <div class="w3-container">
        <h1>Information about the LEAR</h1>
      </div>

      <div class="w3-row">
        <div class="w3-quarter w3-container">
          <p>
            This section identifies the person who will act as LEAR of  your company.
          </p>
          <p>
            The LEAR is the Legal Entity Appointed Representative,
            and she/he can be any person who is authorized by your company to act on behalf
            of the company within the DOME Marketplace.
            There is specific information about the LEAR in the Knowledge Base.
          </p>
        </div>

        <div class="w3-rest w3-container">
          <div class="w3-panel w3-card-2  w3-light-grey">
            <p>
              <label><b>First name</b></label>
              <input
                name="LEARFirstName"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.learFirstName : null}
                ?readonly=${r}
                required
              />
            </p>

            <p>
              <label><b>Last name</b></label>
              <input
                name="LEARLastName"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.learLastName : null}
                ?readonly=${r}
                required
              />
            </p>

            <p>
              <label><b>Nationality</b></label>
              <input
                name="LEARNationality"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.learNationality : null}
                ?readonly=${r}
                required
              />
            </p>

            <p>
              <label><b>ID card number (optional)</b></label>
              <input
                name="LEARIDNumber"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.learIdcard : null}
                ?readonly=${r}
              />
            </p>

            <p>
              <label><b>Complete postal professional address</b></label>
              <input
                name="LEARPostalAddress"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.learStreet : null}
                ?readonly=${r}
                required
              />
            </p>

            <p>
              <label><b>Email</b></label>
              <input
                name="LEAREmail"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.learEmail : null}
                ?readonly=${r}
                required
              />
            </p>

            <p>
              <label><b>Mobile phone (optional)</b></label>
              <input
                name="LEARMobilePhone"
                class="w3-input w3-border"
                type="text"
                value=${r ? r.learMobile : null}
                ?readonly=${r}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
  return theHtml;
}
MHR.register(
  "BuyerWaitingConfirmation",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter(pageData) {
      debugger;
      const authData = pageData.authData;
      const organization_identifier = authData.organization_identifier;
      const organization = authData.organization;
      const serial_number = authData.serial_number;
      const common_name = authData.common_name;
      var certificateType = "personal";
      if (organization_identifier) {
        if (serial_number) {
          certificateType = "legalRepresentative";
        } else {
          certificateType = "seal";
        }
      }
      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-container w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Waitng for confirmation of your email.
            </div>
            <p class="w3-xlarge">
              We need that you confirm the email address that you provided,
              please look at your inbox. Below you see the information that you
              submitted, for your reference. Once the email is verified,
              refreshing this page will confirm the status.
            </p>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <div class="w3-margin-bottom">
              ${LegalRepresentativeForm()} ${CompanyForm()}
            </div>

            <div
              class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom"
            >
              <div class="w3-container">
                <p>
                  Once you verify your email address, refresh this screen to see
                  updates in the onboarding process.
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      this.render(theHtml, false);
    }
    async fillTestData(ev) {
      ev.preventDefault();
      document.forms["theform"].elements["LegalRepEmail"].value = "jesus@alastria.io";
      document.forms["theform"].elements["CompanyStreetName"].value = "C/ Academia 54";
      document.forms["theform"].elements["CompanyCity"].value = "Madrid";
      document.forms["theform"].elements["CompanyPostal"].value = "28654";
    }
    async validateForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};
      any("form input").classRemove("w3-lightred");
      any("form input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);
      const data = {
        email: form.LegalRepEmail,
        emailVisibility: true,
        password: "12345678",
        passwordConfirm: "12345678"
      };
      try {
        const record = await pb.collection("signers").create(data);
        console.log(record);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message
        });
        return;
      }
      try {
        console.log("Requesting verification");
        var result = await pb.collection("signers").requestVerification(form.LegalRepEmail);
        console.log("After requesting verification:", result);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error requesting verification",
          msg: error.message
        });
        return;
      }
      alert(
        "Registration requested. Please check your email for confirmation."
      );
      window.location = window.location.origin;
    }
  }
);
MHR.register(
  "BuyerOnboardingLogin",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter(pageData) {
      debugger;
      pb.authStore.clear();
      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap">
                  DOME MARKETPLACE
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-container w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Onboarding in DOME
            </div>
            <div class="text-jumbo blinker-bold">as a Buyer of services.</div>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <form
              name="loginform"
              @submit=${(ev) => this.submitForm(ev)}
              id="loginform"
              class="w3-margin-bottom"
            >
              <div class="card w3-card-2 w3-white">
                <div class="w3-container">
                  <h1>Enter your registered email</h1>
                </div>

                <div class="w3-row">
                  <div class="w3-quarter w3-container">
                    <p>
                      Enter the email that you used to register your company.
                      After submitting the form, you will receive a
                      message with a code that you will have to enter in the next form.
                    </p>
                  </div>

                  <div class="w3-rest w3-container">
                    <div class="w3-panel w3-card-2  w3-light-grey">
                      <p>
                        <label><b>Email</b></label>
                        <input
                          name="LegalRepEmail"
                          class="w3-input w3-border"
                          type="text"
                          placeholder="Email"
                          required
                        />
                      </p>

                    </div>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="w3-bar w3-center">
                <button
                  id="login_button"
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  style="width:30%"
                  title="Login"
                >
                  Login
                </button>
              </div>
            </form>

            
          </div>
        </div>
      `;
      this.render(theHtml, false);
    }
    /**
     * @param {SubmitEvent} ev
     */
    async submitForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};
      ev.target;
      any("#loginform input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);
      try {
        const record = await pb.collection("buyers").requestOTP(form.LegalRepEmail);
        console.log(record);
        gotoPage("BuyerOnboardingOTP", {
          email: form.LegalRepEmail,
          otpId: record.otpId
        });
        return;
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message
        });
        return;
      }
    }
  }
);
MHR.register(
  "BuyerOnboardingOTP",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    /**
     * @param {{email: string, otpId: string}} pageData
     */
    async enter(pageData) {
      debugger;
      let email = localStorage.getItem("buyerEmail");
      if (!email) {
        email = "";
      }
      let otpId = localStorage.getItem("buyerOtpId");
      if (!otpId) {
        otpId = "";
      }
      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-container w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Onboarding in DOME
            </div>
            <div class="text-jumbo blinker-bold">as a Buyer of services.</div>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <form
              name="otpform"
              @submit=${(ev) => this.submitForm(ev)}
              id="loginform"
              class="w3-margin-bottom"
            >
              <div class="card w3-card-2 w3-white">
                <div class="w3-container">
                  <h1>Confirm your email</h1>
                </div>

                <div class="w3-row">
                  <div class="w3-quarter w3-container">
                    <p>
                      Please, enter the code that you must have received in your
                      email from us.
                    </p>
                    <p>
                      After submitting the form, you will receive a message for
                      confirmation.
                    </p>
                    <p>
                      If your previous code expired, you can request a new one.
                    </p>
                  </div>

                  <div class="w3-rest w3-container">
                    <div class="w3-panel w3-card-2  w3-light-grey">
                      <p>
                        <label><b>Verification email</b></label>
                        <input
                          name="LegalRepEmail"
                          class="w3-input w3-border"
                          type="text"
                          value=${email}
                          readonly
                        />
                      </p>
                      <p>
                        <label><b>Verification code</b></label>
                        <input
                          name="ReceivedOTP"
                          class="w3-input w3-border"
                          type="text"
                          required
                        />
                      </p>
                      <input
                        name="otpId"
                        type="hidden"
                        value=${otpId}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Buttons -->
              <div class="w3-bar w3-center">
              <button
                  id="login_button"
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  style="width:30%"
                  title="Confirm"
                >
                  Confirm
                </button>
                <div
                  id="anotherotp_button"
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  style="width:30%"
                  title="Request another code"
                  @click=${async () => {
        try {
          const record = await pb.collection("buyers").requestOTP(email);
          console.log(record);
          localStorage.setItem("buyerEmail", email);
          localStorage.setItem("buyerOtpId", record.otpId);
          alert("A new code has been sent to your email.");
          loadPage("buyerotp");
          return;
        } catch (error) {
          myerror(error);
          gotoPage("MessagePage", {
            title: "Error in registration",
            msg: error.message
          });
          return;
        }
      }}
                >
                  Request another code
                </div>
              </div>
            </form>
          </div>
        </div>
      `;
      this.render(theHtml, false);
    }
    /**
     * @param {SubmitEvent} ev
     */
    async submitForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};
      ev.target;
      any("#loginform input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);
      try {
        debugger;
        const authData = await pb.collection("buyers").authWithOTP(form.otpId, form.ReceivedOTP);
        console.log(authData);
        loadPage("buyershow");
        return;
      } catch (error) {
        myerror(error);
        gotoPage("MessagePage", {
          title: "Error in registration",
          msg: error.message
        });
        return;
      }
    }
  }
);
MHR.register(
  "BuyerOnboardingVerify",
  class extends MHR.AbstractPage {
    /**
     * @param {string} id
     */
    constructor(id) {
      super(id);
    }
    async enter(pageData) {
      debugger;
      let params = new URLSearchParams(document.location.search);
      let verificationToken = params.get("token");
      if (!verificationToken) {
        gotoPage("MessagePage", {
          title: "Token not provided",
          msg: "The page has not provided a verification token"
        });
        return;
      }
      try {
        const result = await pb.collection("buyers").confirmVerification(verificationToken);
        console.log("Result:", result);
      } catch (error) {
        console.log("Error:", error);
        gotoPage("MessagePage", {
          title: "Failed verification",
          msg: error.message
        });
        return;
      }
      var theHtml = html`
        <!-- Header -->
        <div class="dome-header">
          <div class="dome-content">
            <div class="w3-bar">
              <div class="w3-bar-item padding-right-0">
                <a href="#">
                  <img
                    src="assets/logos/DOME_Icon_White.svg"
                    alt="DOME Icon"
                    style="width:100%;max-height:32px"
                  />
                </a>
              </div>
              <div class="w3-bar-item">
                <span class="blinker-semibold w3-xlarge nowrap"
                  >DOME MARKETPLACE</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Jumbo -->
        <div
          class="bg-cover"
          style="background-image: url(assets/images/bg_1_shadow.png);"
        >
          <div class="dome-content w3-container w3-text-white">
            <div class="text-jumbo blinker-bold w3-padding-top-48">
              Verification of email.
            </div>
            <p class="w3-xlarge">
              The Marketplace is a digital platform that enables CSPs to offer
              cloud and edge computing services to customers across Europe. The
              main goal of this onboarding process is the creation of an
              operating account for your company so you can start buying
              offerings from CSPs in the Marketplace.
            </p>
          </div>
          <div class="w3-padding-32"></div>
        </div>

        <div class="w3-padding-32" style="background-color: #EDF2FA;">
          <!-- Form -->
          <div class="dome-content">
            <form
              name="theform"
              @submit=${(e) => this.validateForm(e)}
              id="formElements"
              class="w3-margin-bottom"
            >
              ${LegalRepresentativeForm()} ${CompanyForm()}

              <div class="w3-bar w3-center">
                <button
                  class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold"
                  title="Register email"
                >
                  Register email
                </button>
              </div>
            </form>

            <div
              class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom"
            >
              <div class="w3-container">
                <p>
                  Click the "<b>Submit and create documents</b>" button above to
                  create the documents automatically including the data you
                  entered.
                </p>
                <p>
                  If you are not yet ready and want to see how the final
                  documents look like, click the button "<b
                    >Fill with test data</b
                  >" and then the "<b>Submit and create documents</b>" button to
                  create the documents with test data.
                </p>
              </div>
            </div>
          </div>
        </div>
      `;
      this.render(theHtml, false);
    }
    async validateForm(ev) {
      ev.preventDefault();
      debugger;
      var form = {};
      any("form input").classRemove("w3-lightred");
      any("form input").run((el) => {
        if (el.value.length > 0) {
          form[el.name] = el.value;
        } else {
          form[el.name] = "[" + el.name + "]";
        }
      });
      console.log(form);
      const data = {
        email: form.LegalRepEmail,
        emailVisibility: true,
        commonName: form.LegalRepCommonName,
        organization: form.CompanyName,
        street: form.CompanyStreetName,
        city: form.CompanyCity,
        postalCode: form.CompanyPostal,
        country: form.CompanyCountry,
        organizationIdentifier: form.CompanyOrganizationID,
        password: "12345678",
        passwordConfirm: "12345678"
      };
      try {
        const record = await pb.collection("buyers").create(data);
        console.log(record);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error in registration",
          msg: error.message
        });
        return;
      }
      try {
        console.log("Requesting verification");
        var result = await pb.collection("buyers").requestVerification(form.LegalRepEmail);
        console.log("After requesting verification:", result);
      } catch (error) {
        myerror(error);
        gotoPage("ErrorPage", {
          title: "Error requesting verification",
          msg: error.message
        });
        return;
      }
      alert(
        "Registration requested. Please check your email for confirmation."
      );
      goHome();
    }
  }
);
