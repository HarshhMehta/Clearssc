import React from 'react'

const MRIReferralFormDisplay = ({ formData }) => {
  console.log("MRI Form Data: ", formData)

  // Helper function to format boolean values
  const formatBoolean = (value) => {
    if (value === true || value === "YES" || value === "yes") return "Yes"
    if (value === false || value === "NO" || value === "no") return "No"
    if (value === "unknown") return "Unknown"
    if (value === "n/a") return "N/A"
    return value || "Not specified"
  }

  // Helper function to format dates
  const formatDate = (dateValue) => {
    if (!dateValue) return "Not provided"
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString()
    }
    // Handle the date format from your data (05/12/01)
    if (typeof dateValue === "string" && dateValue.includes("/")) {
      return dateValue
    }
    return dateValue
  }

  // High-quality PDF Download function with direct element styling
  const downloadAsPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).default

      const element = document.getElementById("mri-referral-form")
      if (!element) return

      // Hide the download button temporarily
      const downloadBtn = document.getElementById("download-btn")
      if (downloadBtn) downloadBtn.style.display = "none"

      // Store original styles to restore later
      const originalStyles = new Map()

      // Function to apply PDF styles directly to elements
      const applyPDFStyles = (el) => {
        // Store original style
        originalStyles.set(el, el.style.cssText)

        // Apply PDF-specific styles directly
        if (el.id === "mri-referral-form") {
          el.style.cssText += `
            background: white !important;
            font-family: Arial, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
            color: black !important;
            width: 794px !important;
            max-width: 794px !important;
            padding: 20px !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
            position: relative !important;
          `
        }

        // Fix spacing for all elements
        if (el.classList.contains("mb-1")) {
          el.style.marginBottom = "6px !important"
        }
        if (el.classList.contains("mb-2")) {
          el.style.marginBottom = "10px !important"
        }
        if (el.classList.contains("mb-4")) {
          el.style.marginBottom = "16px !important"
        }
        if (el.classList.contains("p-2")) {
          el.style.padding = "8px !important"
        }
        if (el.classList.contains("min-h-[20px]")) {
          el.style.minHeight = "20px !important"
          el.style.paddingBottom = "2px !important"
        }
        if (el.classList.contains("h-12")) {
          el.style.height = "48px !important"
        }
        if (el.classList.contains("h-10")) {
          el.style.height = "40px !important"
        }
        if (el.classList.contains("h-8")) {
          el.style.height = "32px !important"
        }
        if (el.classList.contains("text-lg")) {
          el.style.fontSize = "16px !important"
        }
        if (el.classList.contains("text-sm")) {
          el.style.fontSize = "12px !important"
        }
        if (el.classList.contains("text-xs")) {
          el.style.fontSize = "10px !important"
        }
        if (el.classList.contains("w-1/2")) {
          el.style.width = "50% !important"
        }
        if (el.classList.contains("w-3")) {
          el.style.width = "12px !important"
        }
        if (el.classList.contains("h-3")) {
          el.style.height = "12px !important"
        }
        if (el.classList.contains("border-black")) {
          el.style.borderColor = "black !important"
        }
        if (el.classList.contains("border-2")) {
          el.style.border = "2px solid black !important"
        }
        if (el.classList.contains("border-b")) {
          el.style.borderBottom = "1px solid black !important"
        }
        if (el.classList.contains("border-r")) {
          el.style.borderRight = "1px solid black !important"
        }
        if (el.classList.contains("flex")) {
          el.style.display = "flex !important"
        }
        if (el.classList.contains("grid")) {
          el.style.display = "grid !important"
        }
        if (el.classList.contains("grid-cols-3")) {
          el.style.gridTemplateColumns = "repeat(3, 1fr) !important"
          el.style.gap = "4px !important"
        }
        if (el.classList.contains("gap-1")) {
          el.style.gap = "4px !important"
        }
        if (el.classList.contains("gap-4")) {
          el.style.gap = "8px !important"
        }
        if (el.classList.contains("items-center")) {
          el.style.alignItems = "center !important"
        }
        if (el.classList.contains("justify-between")) {
          el.style.justifyContent = "space-between !important"
        }
        if (el.classList.contains("text-center")) {
          el.style.textAlign = "center !important"
        }
        if (el.classList.contains("font-bold")) {
          el.style.fontWeight = "bold !important"
        }

        // Apply to all child elements recursively
        Array.from(el.children).forEach((child) => applyPDFStyles(child))
      }

      // Apply styles to the main element and all children
      applyPDFStyles(element)

      // Wait for styles to apply and layout to settle
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Capture with high quality settings
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 794,
        height: element.scrollHeight,
        windowWidth: 794,
        windowHeight: element.scrollHeight,
      })

      // Restore original styles
      originalStyles.forEach((originalStyle, el) => {
        el.style.cssText = originalStyle
      })

      // Show the download button again
      if (downloadBtn) downloadBtn.style.display = "block"

      const imgData = canvas.toDataURL("image/png", 1.0)

      // Create PDF with A4 dimensions
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = 210
      const pdfHeight = 297

      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      // Center the image on the page
      const xOffset = 0
      const yOffset = 0

      // If content fits on one page
      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight)
      } else {
        // If content is too tall, scale it to fit
        const scaledHeight = pdfHeight
        const scaledWidth = (canvas.width * pdfHeight) / canvas.height
        const centeredX = (pdfWidth - scaledWidth) / 2
        pdf.addImage(imgData, "PNG", centeredX, yOffset, scaledWidth, scaledHeight)
      }

      const patientName = `${formData?.firstName || "Patient"}_${formData?.surname || "Form"}`
      pdf.save(`MRI_Referral_${patientName}_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  // If no form data provided, show sample structure
  if (!formData) {
    return (
      <div className="max-w-5xl mx-auto p-4 bg-white">
        <div className="text-center p-8 bg-gray-50 rounded-lg border">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No MRI Form Data</h2>
          <p className="text-gray-500">Form data will appear here when submitted</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white">
      {/* Download Button */}
      <div className="mb-4 text-center">
        <button
          id="download-btn"
          onClick={downloadAsPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors"
        >
          📄 Download PDF
        </button>
      </div>

      <div id="mri-referral-form" className="bg-white print:p-2 print:m-0 space-y-1">
        {/* Header */}
       

        <h1
          className="text-xl font-bold text-center mb-4"
          style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center", margin: "0 0 16px 0" }}
        >
          MRI REFERRAL REQUEST
        </h1>

        <div className="border-2 border-black" style={{ border: "2px solid black" }}>
          {/* Patient Information and Area to be Examined */}
          <div className="flex border-b border-black" style={{ display: "flex", borderBottom: "1px solid black" }}>
            <div
              className="w-1/2 p-2 border-r border-black"
              style={{ width: "50%", padding: "8px", borderRight: "1px solid black" }}
            >
              <h2 className="font-bold" style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
                PATIENT INFORMATION
              </h2>

              <div className="mb-1" style={{ marginBottom: "4px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  NAME:
                </label>
                <div className="flex" style={{ display: "flex" }}>
                  <div
                    className="border-b border-black w-full mr-1 min-h-[20px]"
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      marginRight: "4px",
                      minHeight: "20px",
                      display: "flex",
                      alignItems: "end",
                      paddingBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "600" }}>
                      {formData.surname || formData.lastName || ""}
                    </span>
                  </div>
                  <div
                    className="border-b border-black w-full min-h-[20px]"
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      minHeight: "20px",
                      display: "flex",
                      alignItems: "end",
                      paddingBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "600" }}>
                      {formData.firstName || formData.patientName || ""}
                    </span>
                  </div>
                </div>
                <div className="flex text-xs" style={{ display: "flex", fontSize: "10px" }}>
                  <span style={{ width: "50%", marginRight: "4px" }}>SURNAME</span>
                  <span style={{ width: "50%" }}>FIRST NAME</span>
                </div>
              </div>

              <div className="mb-1" style={{ marginBottom: "4px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  ADDRESS:
                </label>
                <div className="flex" style={{ display: "flex" }}>
                  <div
                    className="border-b border-black w-full mr-1 min-h-[20px]"
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      marginRight: "4px",
                      minHeight: "20px",
                      display: "flex",
                      alignItems: "end",
                      paddingBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>
                      {formData.street || formData.streetAddress || formData.address || ""}
                    </span>
                  </div>
                  <div
                    className="border-b border-black w-full min-h-[20px]"
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      minHeight: "20px",
                      display: "flex",
                      alignItems: "end",
                      paddingBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>
                      {formData.aptNumber || formData.apartment || formData.unit || ""}
                    </span>
                  </div>
                </div>
                <div className="flex text-xs" style={{ display: "flex", fontSize: "10px" }}>
                  <span style={{ width: "75%", marginRight: "4px" }}>STREET</span>
                  <span style={{ width: "25%" }}>APT #</span>
                </div>
              </div>

              <div className="mb-1" style={{ marginBottom: "4px" }}>
                <div className="flex" style={{ display: "flex" }}>
                  <div
                    className="border-b border-black w-full mr-1 min-h-[20px]"
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      marginRight: "4px",
                      minHeight: "20px",
                      display: "flex",
                      alignItems: "end",
                      paddingBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>{formData.city || ""}</span>
                  </div>
                  <div
                    className="border-b border-black w-full min-h-[20px]"
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      minHeight: "20px",
                      display: "flex",
                      alignItems: "end",
                      paddingBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>{formData.postalCode || formData.zipCode || ""}</span>
                  </div>
                </div>
                <div className="flex text-xs" style={{ display: "flex", fontSize: "10px" }}>
                  <span style={{ width: "50%", marginRight: "4px" }}>CITY</span>
                  <span style={{ width: "50%" }}>POSTAL CODE</span>
                </div>
              </div>

              <div className="mb-1" style={{ marginBottom: "4px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  PHONE:
                </label>
                <div className="flex" style={{ display: "flex" }}>
                  <div style={{ marginRight: "8px" }}>
                    <span style={{ fontSize: "10px", marginRight: "4px" }}>H</span>
                    <div
                      className="border-b border-black min-h-[20px]"
                      style={{
                        borderBottom: "1px solid black",
                        width: "120px",
                        minHeight: "20px",
                        display: "inline-flex",
                        alignItems: "end",
                        paddingBottom: "2px",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
                        {formData.phoneHome || formData.homePhone || ""}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", marginRight: "4px" }}>W</span>
                    <div
                      className="border-b border-black min-h-[20px]"
                      style={{
                        borderBottom: "1px solid black",
                        width: "120px",
                        minHeight: "20px",
                        display: "inline-flex",
                        alignItems: "end",
                        paddingBottom: "2px",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
                        {formData.phoneWork || formData.workPhone || ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-1" style={{ marginBottom: "4px" }}>
                <div className="flex items-center" style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ fontSize: "12px", marginRight: "4px" }}>DOB: (D/M/Y)</label>
                  <div
                    className="border-b border-black mr-4 min-h-[20px]"
                    style={{
                      borderBottom: "1px solid black",
                      width: "120px",
                      marginRight: "16px",
                      minHeight: "20px",
                      display: "flex",
                      alignItems: "end",
                      paddingBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "600" }}>
                      {formatDate(formData.dob || formData.dateOfBirth)}
                    </span>
                  </div>
                  <label style={{ fontSize: "12px", marginRight: "4px" }}>SEX:</label>
                  <div className="flex items-center" style={{ display: "flex", alignItems: "center" }}>
                    <div
                      className="flex items-center mr-2"
                      style={{ display: "flex", alignItems: "center", marginRight: "8px" }}
                    >
                      <div
                        className="w-3 h-3 border border-black mr-1"
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "1px solid black",
                          marginRight: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {(formData.sex === "M" || formData.gender === "Male") && (
                          <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                        )}
                      </div>
                      <span style={{ fontSize: "12px" }}>M</span>
                    </div>
                    <div className="flex items-center" style={{ display: "flex", alignItems: "center" }}>
                      <div
                        className="w-3 h-3 border border-black mr-1"
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "1px solid black",
                          marginRight: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {(formData.sex === "F" || formData.gender === "Female") && (
                          <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                        )}
                      </div>
                      <span style={{ fontSize: "12px" }}>F</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-1" style={{ marginBottom: "4px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  HEALTH CARD #:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: "600" }}>
                    {formData.healthCardNumber || ""}
                  </span>
                </div>
              </div>

              <div className="mb-1" style={{ marginBottom: "4px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  IS THIS A WSIB CLAIM?
                </label>
                <div className="flex items-center" style={{ display: "flex", alignItems: "center" }}>
                  <div
                    className="flex items-center mr-4"
                    style={{ display: "flex", alignItems: "center", marginRight: "16px" }}
                  >
                    <div
                      className="w-3 h-3 border border-black mr-1"
                      style={{
                        width: "12px",
                        height: "12px",
                        border: "1px solid black",
                        marginRight: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {(formData.isWsibClaim === "YES" || formData.isWsibClaim === true) && (
                        <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                      )}
                    </div>
                    <span style={{ fontSize: "12px" }}>YES</span>
                  </div>
                  <div className="flex items-center" style={{ display: "flex", alignItems: "center" }}>
                    <div
                      className="w-3 h-3 border border-black mr-1"
                      style={{
                        width: "12px",
                        height: "12px",
                        border: "1px solid black",
                        marginRight: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {(formData.isWsibClaim === "NO" || formData.isWsibClaim === false) && (
                        <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                      )}
                    </div>
                    <span style={{ fontSize: "12px" }}>NO</span>
                  </div>
                </div>
              </div>

              <div className="mb-1" style={{ marginBottom: "4px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  CLAIM #:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px", fontFamily: "monospace" }}>{formData.claimNumber || ""}</span>
                </div>
              </div>

              <div className="mb-1" style={{ marginBottom: "4px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  PRIORITY:
                </label>
                <div
                  className="grid grid-cols-3 gap-1"
                  style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}
                >
                  {[
                    "URGENT (WITHIN 1 WK)",
                    "SEMI-URGENT (2-8 WKS)",
                    "INPATIENT",
                    "ELECTIVE",
                    "NON-RES",
                    "DIALYSIS PATIENT",
                  ].map((priorityOption) => (
                    <div
                      key={priorityOption}
                      className="flex items-center"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <div
                        className="w-3 h-3 border border-black mr-1"
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "1px solid black",
                          marginRight: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {formData.priority === priorityOption && (
                          <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                        )}
                      </div>
                      <span style={{ fontSize: "10px" }}>{priorityOption}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-1/2 p-2" style={{ width: "50%", padding: "8px" }}>
              <h2 className="font-bold" style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
                AREA TO BE EXAMINED: (Be specific)
              </h2>
              <div
                className="w-full border border-gray-300 p-1 bg-gray-50"
                style={{
                  width: "100%",
                  height: "48px",
                  border: "1px solid #d1d5db",
                  padding: "4px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <p style={{ fontSize: "12px", whiteSpace: "pre-wrap", margin: "0" }}>
                  {formData.areaToBeExamined || formData.bodyPart || ""}
                </p>
              </div>

              <h2 className="font-bold mt-2" style={{ fontWeight: "bold", margin: "8px 0 4px 0" }}>
                CLINICAL INFORMATION:
              </h2>
              <div
                className="w-full border border-gray-300 p-1 bg-gray-50"
                style={{
                  width: "100%",
                  height: "48px",
                  border: "1px solid #d1d5db",
                  padding: "4px",
                  backgroundColor: "#f9fafb",
                }}
              >
                <p style={{ fontSize: "12px", whiteSpace: "pre-wrap", margin: "0" }}>
                  {formData.clinicalInformation || formData.symptoms || ""}
                </p>
              </div>

              <div style={{ marginTop: "8px" }}>
                <h2 className="font-bold" style={{ fontWeight: "bold", margin: "0 0 4px 0" }}>
                  WORKING DIAGNOSIS:
                </h2>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>{formData.workingDiagnosis || formData.diagnosis || ""}</span>
                </div>
              </div>

              <div className="flex mt-2" style={{ display: "flex", marginTop: "8px" }}>
                <div className="w-1/2" style={{ width: "50%" }}>
                  <h2 className="font-bold" style={{ fontWeight: "bold", margin: "0 0 4px 0" }}>
                    REFERRING MD SIGNATURE
                  </h2>
                  <div
                    className="border-b border-black w-full min-h-[20px]"
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      minHeight: "20px",
                      display: "flex",
                      alignItems: "end",
                      paddingBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: "600" }}>
                      {formData.physicianName || formData.referringPhysician || ""}
                    </span>
                  </div>
                </div>
                <div className="w-1/2" style={{ width: "50%" }}>
                  <h2 style={{ fontSize: "12px", margin: "0 0 4px 0" }}>Redirect to:</h2>
                  {["THC", "HHS Oakville", "Any if waitlist is shorter"].map((redirectOption) => (
                    <div
                      key={redirectOption}
                      className="flex items-center"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <div
                        className="w-3 h-3 border border-black mr-1"
                        style={{
                          width: "12px",
                          height: "12px",
                          border: "1px solid black",
                          marginRight: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {formData.redirectTo === redirectOption && (
                          <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                        )}
                      </div>
                      <span style={{ fontSize: "10px" }}>{redirectOption}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Patient Screening Section */}
          <div className="border-b border-black" style={{ borderBottom: "1px solid black" }}>
            <div style={{ padding: "8px" }}>
              <h2 className="font-bold" style={{ fontWeight: "bold", margin: "0 0 4px 0" }}>
                PATIENT SCREENING (MUST BE COMPLETED WITH PATIENT)
              </h2>
              <p style={{ fontSize: "12px", margin: "0 0 8px 0" }}>PLEASE CHECK THE FOLLOWING</p>

              <div className="flex" style={{ display: "flex", marginTop: "8px" }}>
                <div style={{ width: "66.67%" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}>
                    {[
                      { key: "previousMri", text: "1. HAVE YOU EVER HAD A PREVIOUS MRI?" },
                      { key: "metalGrinder", text: "2. HAVE YOU EVER WORKED AS A METAL GRINDER OR WELDER?" },
                      { key: "eyeInjury", text: "3. HAVE YOU EVER HAD A KNOWN INJURY TO YOUR EYE WITH METAL" },
                      { key: "pregnancy", text: "4. IS THERE ANY CHANCE THAT YOU COULD BE PREGNANT?" },
                      { key: "claustrophobic", text: "5. ARE YOU CLAUSTROPHOBIC?" },
                    ].map((question) => (
                      <div
                        key={question.key}
                        className="flex items-center justify-between"
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                      >
                        <span style={{ fontSize: "10px" }}>{question.text}</span>
                        <div className="flex" style={{ display: "flex" }}>
                          <div
                            className="flex items-center mr-4"
                            style={{ display: "flex", alignItems: "center", marginRight: "16px" }}
                          >
                            <div
                              className="w-3 h-3 border border-black mr-1"
                              style={{
                                width: "12px",
                                height: "12px",
                                border: "1px solid black",
                                marginRight: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {(formData.screeningQuestions?.[question.key] === "YES" ||
                                formData.screeningQuestions?.[question.key] === true) && (
                                <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                              )}
                            </div>
                            <span style={{ fontSize: "10px" }}>YES</span>
                          </div>
                          <div className="flex items-center" style={{ display: "flex", alignItems: "center" }}>
                            <div
                              className="w-3 h-3 border border-black mr-1"
                              style={{
                                width: "12px",
                                height: "12px",
                                border: "1px solid black",
                                marginRight: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {(formData.screeningQuestions?.[question.key] === "NO" ||
                                formData.screeningQuestions?.[question.key] === false) && (
                                <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                              )}
                            </div>
                            <span style={{ fontSize: "10px" }}>NO</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: "10px", margin: "8px 0" }}>
                    (IF YES, MEDS TO BE PROVIDED BY REFERRING PHYSICIAN)
                  </p>

                  <div style={{ marginTop: "8px" }}>
                    <p style={{ fontSize: "10px", fontWeight: "bold", margin: "0 0 4px 0" }}>
                      6. DO YOU HAVE THE FOLLOWING?
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px", marginTop: "4px" }}>
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
                        { key: "dentures", text: "DENTURES" },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between"
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                        >
                          <span style={{ fontSize: "10px" }}>{item.text}</span>
                          <div className="flex" style={{ display: "flex" }}>
                            <div
                              className="flex items-center mr-4"
                              style={{ display: "flex", alignItems: "center", marginRight: "16px" }}
                            >
                              <div
                                className="w-3 h-3 border border-black mr-1"
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  border: "1px solid black",
                                  marginRight: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {(formData.screeningQuestions?.[item.key] === "YES" ||
                                  formData.screeningQuestions?.[item.key] === true) && (
                                  <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                                )}
                              </div>
                              <span style={{ fontSize: "10px" }}>YES</span>
                            </div>
                            <div className="flex items-center" style={{ display: "flex", alignItems: "center" }}>
                              <div
                                className="w-3 h-3 border border-black mr-1"
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  border: "1px solid black",
                                  marginRight: "4px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {(formData.screeningQuestions?.[item.key] === "NO" ||
                                  formData.screeningQuestions?.[item.key] === false) && (
                                  <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                                )}
                              </div>
                              <span style={{ fontSize: "10px" }}>NO</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ width: "33.33%", paddingLeft: "16px" }}>
                  <div
                    className="flex items-center justify-between mb-2"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>PATIENT WEIGHT:</span>
                    <div className="flex items-center" style={{ display: "flex", alignItems: "center" }}>
                      <div
                        className="border-b border-black min-h-[20px]"
                        style={{
                          borderBottom: "1px solid black",
                          width: "64px",
                          textAlign: "right",
                          minHeight: "20px",
                          display: "flex",
                          alignItems: "end",
                          paddingBottom: "2px",
                          justifyContent: "end",
                        }}
                      >
                        <span style={{ fontSize: "12px", fontWeight: "600" }}>{formData.patientWeight || ""}</span>
                      </div>
                      <span style={{ marginLeft: "4px", fontSize: "12px" }}>Kgs</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <p style={{ fontSize: "10px", margin: "0 0 4px 0" }}>
                      7. PLEASE INDICATE ALL SURGICAL HISTORY: (SPECIFY AREA, TYPE, DATE)
                    </p>
                    <div
                      className="w-full border border-gray-300 p-1 bg-gray-50"
                      style={{
                        width: "100%",
                        height: "40px",
                        border: "1px solid #d1d5db",
                        padding: "4px",
                        marginTop: "4px",
                        backgroundColor: "#f9fafb",
                      }}
                    >
                      <p style={{ fontSize: "10px", whiteSpace: "pre-wrap", margin: "0" }}>
                        {formData.surgicalHistory || ""}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                    {[
                      { key: "head", label: "HEAD" },
                      { key: "neck", label: "NECK" },
                      { key: "spine", label: "SPINE" },
                      { key: "chest", label: "CHEST" },
                      { key: "abdomen", label: "ABDOMEN" },
                      { key: "extremity", label: "EXTREMITY" },
                    ].map((area) => (
                      <div
                        key={area.key}
                        className="flex items-start"
                        style={{ display: "flex", alignItems: "flex-start" }}
                      >
                        <div
                          className="w-3 h-3 border border-black mr-2 mt-1"
                          style={{
                            width: "12px",
                            height: "12px",
                            border: "1px solid black",
                            marginRight: "8px",
                            marginTop: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {formData.examAreaSelections?.[area.key] && (
                            <div style={{ width: "8px", height: "8px", backgroundColor: "black" }}></div>
                          )}
                        </div>
                        <span style={{ fontSize: "12px" }}>{area.label}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <p style={{ fontSize: "12px", margin: "0 0 4px 0" }}>PATIENT SIGNATURE:</p>
                    <div
                      className="border-b border-black"
                      style={{ borderBottom: "1px solid black", height: "32px", marginTop: "4px" }}
                    ></div>
                  </div>

                  <div style={{ marginTop: "16px" }}>
                    <p style={{ fontSize: "12px", margin: "0 0 4px 0" }}>TECHNOLOGIST:</p>
                    <div
                      className="border-b border-black"
                      style={{ borderBottom: "1px solid black", height: "32px", marginTop: "4px" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referring Physician Info and Other Relevant Tests */}
          <div className="flex" style={{ display: "flex" }}>
            <div
              className="w-1/2 border-r border-black"
              style={{ width: "50%", padding: "8px", borderRight: "1px solid black" }}
            >
              <h2 className="font-bold" style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
                REFERRING PHYSICIAN INFO:
              </h2>

              <div style={{ marginBottom: "8px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  ADDRESS:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>
                    {formData.referringPhysicianAddress ||
                      formData.physicianClinic ||
                      formData.clinic ||
                      formData.hospital ||
                      ""}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "8px", display: "flex" }}>
                <div style={{ width: "50%" }}>
                  <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                    POSTAL CODE:
                  </label>
                  <div
                    className="border-b border-black w-full min-h-[20px]"
                    style={{
                      borderBottom: "1px solid black",
                      width: "100%",
                      minHeight: "20px",
                      display: "flex",
                      alignItems: "end",
                      paddingBottom: "2px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>
                      {formData.referringPhysicianPostalCode || formData.physicianPostalCode || ""}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  P:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
                    {formData.referringPhysicianPhone || formData.physicianPhone || formData.physicianContact || ""}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  F:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
                    {formData.referringPhysicianFax || formData.physicianFax || ""}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  COPIES TO:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>{formData.copiesTo || ""}</span>
                </div>
              </div>
            </div>

            <div className="w-1/2" style={{ width: "50%", padding: "8px" }}>
              <h2 className="font-bold" style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
                OTHER RELEVANT TESTS & RESULTS
              </h2>

              <div style={{ marginBottom: "8px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  MRI:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>{formData.mri || formData.previousMRI || ""}</span>
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  CT/ANGIO:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>{formData.ctAngio || formData.previousCT || ""}</span>
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  X-RAY:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>{formData.xray || formData.previousXRay || ""}</span>
                </div>
              </div>

              <div style={{ marginBottom: "8px" }}>
                <label className="block text-sm" style={{ display: "block", fontSize: "12px", margin: "0" }}>
                  US:
                </label>
                <div
                  className="border-b border-black w-full min-h-[20px]"
                  style={{
                    borderBottom: "1px solid black",
                    width: "100%",
                    minHeight: "20px",
                    display: "flex",
                    alignItems: "end",
                    paddingBottom: "2px",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>{formData.us || formData.previousUS || ""}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "8px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", fontWeight: "bold", margin: "0" }}>MRI REFERRAL REQUEST</p>
          </div>
        </div>

        {/* Form Submission Info */}
        <div
          style={{
            marginTop: "16px",
            padding: "8px",
            backgroundColor: "#f9fafb",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "10px", color: "#6b7280", margin: "0" }}>
            Form generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
          {formData.submissionDate && (
            <p style={{ fontSize: "10px", color: "#6b7280", margin: "0" }}>
              Original submission: {formatDate(formData.submissionDate)}
            </p>
          )}
          {formData.confirmationNumber && (
            <p style={{ fontSize: "10px", fontFamily: "monospace", fontWeight: "bold", margin: "0" }}>
              Confirmation: {formData.confirmationNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MRIReferralFormDisplay
