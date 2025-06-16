import { useState } from "react";

const MriReferralRequest = ({ onFormDataChange }) => {
  const [formData, setFormData] = useState({
    surname: "",
    firstName: "",
    street: "",
    aptNumber: "",
    city: "",
    postalCode: "",
    phoneHome: "",
    phoneWork: "",
    dob: "",
    sex: "",
    healthCardNumber: "",
    isWsibClaim: "",
    claimNumber: "",
    priority: "",
    areaToBeExamined: "",
    clinicalInformation: "",
    workingDiagnosis: "",
    redirectTo: "",
    patientWeight: "",
    surgicalHistory: "",
    screeningQuestions: {
      previousMri: "",
      metalGrinder: "",
      eyeInjury: "",
      pregnancy: "",
      claustrophobic: "",
      cardiacPacemaker: "",
      cochlearImplants: "",
      eyeSurgery: "",
      cerebralAneurysm: "",
      heartValve: "",
      shrapnel: "",
      jointReplacement: "",
      intravascular: "",
      surgicalClips: "",
      tissueExpander: "",
      implantedDevices: "",
      vascularAccess: "",
      iudDiaphragm: "",
      painPump: "",
      medicationPatch: "",
      penileProsthesis: "",
      hearingAid: "",
      piercings: "",
      tattoo: "",
      dentures: "",
    },
    examAreaSelections: {
      head: false,
      neck: false,
      spine: false,
      chest: false,
      abdomen: false,
      extremity: false,
    },
    patientSignature: "",
    technologist: "",
    referringPhysicianAddress: "",
    referringPhysicianPostalCode: "",
    referringPhysicianPhone: "",
    referringPhysicianFax: "",
    copiesTo: "",
    mri: "",
    ctAngio: "",
    xray: "",
    us: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let updatedFormData;
    
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      updatedFormData = {
        ...formData,
        [section]: {
          ...formData[section],
          [field]: type === "checkbox" ? checked : value,
        },
      };
    } else {
      updatedFormData = {
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      };
    }
    
    setFormData(updatedFormData);
    
    // Pass data back to parent
    if (onFormDataChange) {
      onFormDataChange(updatedFormData);
    }
  };

  // Handle priority checkboxes (only one can be selected)
  const handlePriorityChange = (e) => {
    const { value, checked } = e.target;
    const updatedFormData = {
      ...formData,
      priority: checked ? value : "",
    };
    setFormData(updatedFormData);
    
    if (onFormDataChange) {
      onFormDataChange(updatedFormData);
    }
  };

  // Handle redirect checkboxes (only one can be selected)
  const handleRedirectChange = (e) => {
    const { value, checked } = e.target;
    const updatedFormData = {
      ...formData,
      redirectTo: checked ? value : "",
    };
    setFormData(updatedFormData);
    
    if (onFormDataChange) {
      onFormDataChange(updatedFormData);
    }
  };

  return (
    <div id="mri-referral-form" className="max-w-5xl mx-auto p-4 bg-white">
      



      <div className="border border-black">
        {/* Patient Information and Area to be Examined */}
        <div className="flex border-b border-black">
          <div className="w-1/2 p-2 border-r border-black">
            <h2 className="font-bold">PATIENT INFORMATION</h2>

            <div className="mb-2">
              <label className="block text-sm">NAME:</label>
              <div className="flex">
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className="border-b border-black w-1/2 mr-1 focus:outline-none"
                />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="border-b border-black w-1/2 focus:outline-none"
                />
              </div>
              <div className="flex text-xs">
                <span className="w-1/2 mr-1">SURNAME</span>
                <span className="w-1/2">FIRST NAME</span>
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm">ADDRESS:</label>
              <div className="flex">
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="border-b border-black w-3/4 mr-1 focus:outline-none"
                />
                <input
                  type="text"
                  name="aptNumber"
                  value={formData.aptNumber}
                  onChange={handleChange}
                  className="border-b border-black w-1/4 focus:outline-none"
                />
              </div>
              <div className="flex text-xs">
                <span className="w-3/4 mr-1">STREET</span>
                <span className="w-1/4">APT #</span>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="border-b border-black w-1/2 mr-1 focus:outline-none"
                />
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="border-b border-black w-1/2 focus:outline-none"
                />
              </div>
              <div className="flex text-xs">
                <span className="w-1/2 mr-1">CITY</span>
                <span className="w-1/2">POSTAL CODE</span>
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm">PHONE:</label>
              <div className="flex">
                <div className="mr-1">
                  <span className="text-xs mr-1">H</span>
                  <input
                    type="text"
                    name="phoneHome"
                    value={formData.phoneHome}
                    onChange={handleChange}
                    className="border-b border-black w-40 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-xs mr-1">W</span>
                  <input
                    type="text"
                    name="phoneWork"
                    value={formData.phoneWork}
                    onChange={handleChange}
                    className="border-b border-black w-40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex items-center">
                <label className="text-sm mr-1">DOB: (D/M/Y)</label>
                <input
                  type="text"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="border-b border-black w-40 mr-4 focus:outline-none"
                />
                <label className="text-sm mr-1">SEX:</label>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="sex"
                    value="M"
                    checked={formData.sex === "M"}
                    onChange={handleChange}
                    className="mr-1"
                  />
                  <span className="mr-2">M</span>
                  <input
                    type="radio"
                    name="sex"
                    value="F"
                    checked={formData.sex === "F"}
                    onChange={handleChange}
                    className="mr-1"
                  />
                  <span>F</span>
                </div>
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm">HEALTH CARD #:</label>
              <input
                type="text"
                name="healthCardNumber"
                value={formData.healthCardNumber}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm">IS THIS A WSIB CLAIM?</label>
              <div className="flex items-center">
                <input
                  type="radio"
                  name="isWsibClaim"
                  value="YES"
                  checked={formData.isWsibClaim === "YES"}
                  onChange={handleChange}
                  className="mr-1"
                />
                <span className="mr-4">YES</span>
                <input
                  type="radio"
                  name="isWsibClaim"
                  value="NO"
                  checked={formData.isWsibClaim === "NO"}
                  onChange={handleChange}
                  className="mr-1"
                />
                <span>NO</span>
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm">CLAIM #:</label>
              <input
                type="text"
                name="claimNumber"
                value={formData.claimNumber}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm">PRIORITY:</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  "URGENT (WITHIN 1 WK)",
                  "SEMI-URGENT (2-8 WKS)",
                  "INPATIENT",
                  "ELECTIVE",
                  "NON-RES",
                  "DIALYSIS PATIENT"
                ].map((priorityOption) => (
                  <div key={priorityOption} className="flex items-center">
                    <input
                      type="checkbox"
                      name="priority"
                      value={priorityOption}
                      checked={formData.priority === priorityOption}
                      onChange={handlePriorityChange}
                      className="mr-1"
                    />
                    <span className="text-xs">{priorityOption}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-1/2 p-2">
            <h2 className="font-bold">AREA TO BE EXAMINED: (Be specific)</h2>
            <textarea
              name="areaToBeExamined"
              value={formData.areaToBeExamined}
              onChange={handleChange}
              className="w-full h-20 border border-gray-300 focus:outline-none p-1"
            ></textarea>

            <h2 className="font-bold mt-4">CLINICAL INFORMATION:</h2>
            <textarea
              name="clinicalInformation"
              value={formData.clinicalInformation}
              onChange={handleChange}
              className="w-full h-20 border border-gray-300 focus:outline-none p-1"
            ></textarea>

            <div className="mt-4">
              <h2 className="font-bold">WORKING DIAGNOSIS:</h2>
              <input
                type="text"
                name="workingDiagnosis"
                value={formData.workingDiagnosis}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>

            <div className="flex mt-4">
              <div className="w-1/2">
                <h2 className="font-bold">REFERRING MD SIGNATURE</h2>
                <div className="border-b border-black h-8 mt-1"></div>
              </div>
              <div className="w-1/2">
                <h2 className="text-sm">Redirect to:</h2>
                {[
                  "THC",
                  "HHS Oakville",
                  "Any if waitlist is shorter"
                ].map((redirectOption) => (
                  <div key={redirectOption} className="flex items-center">
                    <input
                      type="checkbox"
                      name="redirectTo"
                      value={redirectOption}
                      checked={formData.redirectTo === redirectOption}
                      onChange={handleRedirectChange}
                      className="mr-1"
                    />
                    <span className="text-xs">{redirectOption}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Patient Screening Section */}
        <div className="border-b border-black">
          <div className="p-2">
            <h2 className="font-bold">PATIENT SCREENING (MUST BE COMPLETED WITH PATIENT)</h2>
            <p className="text-sm">PLEASE CHECK THE FOLLOWING</p>

            <div className="flex mt-2">
              <div className="w-4/6">
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { key: "previousMri", text: "1. HAVE YOU EVER HAD A PREVIOUS MRI?" },
                    { key: "metalGrinder", text: "2. HAVE YOU EVER WORKED AS A METAL GRINDER OR WELDER?" },
                    { key: "eyeInjury", text: "3. HAVE YOU EVER HAD A KNOWN INJURY TO YOUR EYE WITH METAL" },
                    { key: "pregnancy", text: "4. IS THERE ANY CHANCE THAT YOU COULD BE PREGNANT?" },
                    { key: "claustrophobic", text: "5. ARE YOU CLAUSTROPHOBIC?" }
                  ].map((question) => (
                    <div key={question.key} className="flex items-center justify-between">
                      <span className="text-xs">{question.text}</span>
                      <div className="flex">
                        <div className="flex items-center mr-4">
                          <input
                            type="radio"
                            name={`screeningQuestions.${question.key}`}
                            value="YES"
                            checked={formData.screeningQuestions[question.key] === "YES"}
                            onChange={handleChange}
                            className="mr-1"
                          />
                          <span className="text-xs">YES</span>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name={`screeningQuestions.${question.key}`}
                            value="NO"
                            checked={formData.screeningQuestions[question.key] === "NO"}
                            onChange={handleChange}
                            className="mr-1"
                          />
                          <span className="text-xs">NO</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs mt-2">(IF YES, MEDS TO BE PROVIDED BY REFERRING PHYSICIAN)</p>

                <div className="mt-2">
                  <p className="text-xs font-bold">6. DO YOU HAVE THE FOLLOWING?</p>

                  <div className="grid grid-cols-1 gap-1 mt-1">
                    {[
                      { key: "cardiacPacemaker", text: "CARDIAC PACEMAKER OR LEADS STILL IN PLACE" },
                      { key: "cochlearImplants", text: "COCHLEAR IMPLANTS" },
                      { key: "eyeSurgery", text: "EYE SURGERY" },
                      { key: "cerebralAneurysm", text: "CEREBRAL ANEURYSM CLIPS" },
                      { key: "heartValve", text: "HEART VALVE" },
                      { key: "shrapnel", text: "SHRAPNEL/BULLET WOUNDS" },
                      { key: "jointReplacement", text: "JOINT REPLACEMENT" },
                      { key: "intravascular", text: "INTRAVASCULAR COILS/FILTERS/STENTS" },
                      { key: "surgicalClips", text: "SURGICAL CLIPS/STAPLES" },
                      { key: "tissueExpander", text: "TISSUE EXPANDER/BREAST IMPLANTS" },
                      { key: "implantedDevices", text: "IMPLANTED DEVICES (NEUROSTIMULATOR)" },
                      { key: "vascularAccess", text: "VASCULAR ACCESS PORT/CATHETER" },
                      { key: "iudDiaphragm", text: "IUD/DIAPHRAGM" },
                      { key: "painPump", text: "PAIN PUMP" },
                      { key: "medicationPatch", text: "MEDICATION PATCH" },
                      { key: "penileProsthesis", text: "PENILE PROSTHESIS" },
                      { key: "hearingAid", text: "HEARING AID" },
                      { key: "piercings", text: "PIERCINGS" },
                      { key: "tattoo", text: "TATTOO/PERMANENT MAKEUP" },
                      { key: "dentures", text: "DENTURES" }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-xs">{item.text}</span>
                        <div className="flex">
                          <div className="flex items-center mr-4">
                            <input
                              type="radio"
                              name={`screeningQuestions.${item.key}`}
                              value="YES"
                              checked={formData.screeningQuestions[item.key] === "YES"}
                              onChange={handleChange}
                              className="mr-1"
                            />
                            <span className="text-xs">YES</span>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name={`screeningQuestions.${item.key}`}
                              value="NO"
                              checked={formData.screeningQuestions[item.key] === "NO"}
                              onChange={handleChange}
                              className="mr-1"
                            />
                            <span className="text-xs">NO</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-2/6 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">PATIENT WEIGHT:</span>
                  <div className="flex items-center">
                    <input
                      type="text"
                      name="patientWeight"
                      value={formData.patientWeight}
                      onChange={handleChange}
                      className="border-b border-black w-16 focus:outline-none text-right"
                    />
                    <span className="ml-1">Kgs</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs">7. PLEASE INDICATE ALL SURGICAL HISTORY: (SPECIFY AREA, TYPE, DATE)</p>
                  <textarea
                    name="surgicalHistory"
                    value={formData.surgicalHistory}
                    onChange={handleChange}
                    className="w-full h-16 border border-gray-300 focus:outline-none p-1 mt-1"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: "head", label: "HEAD" },
                    { key: "neck", label: "NECK" },
                    { key: "spine", label: "SPINE" },
                    { key: "chest", label: "CHEST" },
                    { key: "abdomen", label: "ABDOMEN" },
                    { key: "extremity", label: "EXTREMITY" }
                  ].map((area) => (
                    <div key={area.key} className="flex items-start">
                      <input
                        type="checkbox"
                        name={`examAreaSelections.${area.key}`}
                        checked={formData.examAreaSelections[area.key]}
                        onChange={handleChange}
                        className="mr-2 mt-1"
                      />
                      <span className="text-sm">{area.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="text-sm">PATIENT SIGNATURE:</p>
                  <div className="border-b border-black h-8 mt-1"></div>
                </div>

                <div className="mt-4">
                  <p className="text-sm">TECHNOLOGIST:</p>
                  <div className="border-b border-black h-8 mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referring Physician Info and Other Relevant Tests */}
        <div className="flex">
          <div className="w-1/2 p-2 border-r border-black">
            <h2 className="font-bold">REFERRING PHYSICIAN INFO:</h2>

            <div className="mb-2">
              <label className="block text-sm">ADDRESS:</label>
              <input
                type="text"
                name="referringPhysicianAddress"
                value={formData.referringPhysicianAddress}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>

            <div className="mb-2 flex">
              <div className="w-1/2">
                <label className="block text-sm">POSTAL CODE:</label>
                <input
                  type="text"
                  name="referringPhysicianPostalCode"
                  value={formData.referringPhysicianPostalCode}
                  onChange={handleChange}
                  className="border-b border-black w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm">P:</label>
              <input
                type="text"
                name="referringPhysicianPhone"
                value={formData.referringPhysicianPhone}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm">F:</label>
              <input
                type="text"
                name="referringPhysicianFax"
                value={formData.referringPhysicianFax}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm">COPIES TO:</label>
              <input
                type="text"
                name="copiesTo"
                value={formData.copiesTo}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="w-1/2 p-2">
            <h2 className="font-bold">OTHER RELEVANT TESTS & RESULTS</h2>

            <div className="mb-2">
              <label className="block text-sm">MRI:</label>
              <input
                type="text"
                name="mri"
                value={formData.mri}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm">CT/ANGIO:</label>
              <input
                type="text"
                name="ctAngio"
                value={formData.ctAngio}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm">X-RAY:</label>
              <input
                type="text"
                name="xray"
                value={formData.xray}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm">US:</label>
              <input
                type="text"
                name="us"
                value={formData.us}
                onChange={handleChange}
                className="border-b border-black w-full focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 text-center">
          <p className="text-sm font-bold">MRI REFERRAL REQUEST</p>
        </div>
      </div>

     
    </div>
  );
};

export default MriReferralRequest;