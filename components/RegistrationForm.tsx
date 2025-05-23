// "use client";

//<<<<<<< mogambi
// import React, { useState, useRef } from "react";
// import { useRouter } from "next/navigation";
//=======
//import React, { useState, useRef } from "react";
//import { useRouter } from "next/navigation";
//import dynamic from "next/dynamic";
//>>>>>>> master

// interface RegistrationFormProps {
//   meetingId: string;
// }

// export default function RegistrationForm({ meetingId }: RegistrationFormProps) {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     organization: "",
//     designation: "",
//     signatureData: "",
//   });

//   const signatureRef = useRef<any>(null);
//   const [errors, setErrors] = useState({
//     name: "",
//     email: "",
//     organization: "",
//     designation: "",
//     signatureData: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });

//     // Clear error when user types
//     if (errors[name as keyof typeof errors]) {
//       setErrors({
//         ...errors,
//         [name]: "",
//       });
//     }
//   };

//   // Clear the signature pad
//   const clearSignature = () => {
//     if (signatureRef.current) {
//       signatureRef.current.clear();
//       setFormData({
//         ...formData,
//         signatureData: "",
//       });
//     }
//   };

//   // Save signature data when completed
//   const saveSignature = () => {
//     if (signatureRef.current && !signatureRef.current.isEmpty()) {
//       try {
//         // Get signature as base64 encoded PNG with transparent background
//         const signatureData = signatureRef.current.toDataURL("image/png");

//         console.log("Signature captured successfully");

//         // Verify it's a valid base64 image string before saving
//         if (signatureData && signatureData.startsWith("data:image")) {
//           setFormData({
//             ...formData,
//             signatureData,
//           });
//           console.log("Signature data saved to form state");

//           // Clear any previous signature errors
//           if (errors.signatureData) {
//             setErrors({
//               ...errors,
//               signatureData: "",
//             });
//           }
//         } else {
//           console.error("Invalid signature format - not a valid image");
//         }
//       } catch (error) {
//         console.error("Error processing signature:", error);
//       }
//     } else {
//       console.log("Signature pad is empty or not initialized");
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {
//       name: "",
//       email: "",
//       organization: "",
//       designation: "",
//       signatureData: "",
//     };
//     let isValid = true;

//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required";
//       isValid = false;
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//       isValid = false;
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email is invalid";
//       isValid = false;
//     }

//     if (!formData.organization.trim()) {
//       newErrors.organization = "Organization is required";
//       isValid = false;
//     }

//     if (!formData.designation.trim()) {
//       newErrors.designation = "Designation is required";
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await fetch("/api/attendees", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           meetingId,
//           ...formData,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to register");
//       }

//       // Navigate to success page
//       router.push(`/meetings/${meetingId}/register/success`);
//     } catch (error) {
//       console.error("Registration error:", error);
//       alert("An error occurred while registering. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div>
//         <label
//           htmlFor="name"
//           className="block text-sm font-medium text-[#014a2f] mb-1"
//         >
//           Full Name
//         </label>
//         <input
//           type="text"
//           id="name"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//             errors.name
//               ? "border-red-500 focus:ring-red-200"
//               : "border-gray-300 focus:ring-[#014a2f]/20"
//           }`}
//           placeholder="Enter your full name"
//         />
//         {errors.name && (
//           <p className="mt-1 text-sm text-red-600">{errors.name}</p>
//         )}
//       </div>

//       <div>
//         <label
//           htmlFor="email"
//           className="block text-sm font-medium text-[#014a2f] mb-1"
//         >
//           Email Address
//         </label>
//         <input
//           type="email"
//           id="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//             errors.email
//               ? "border-red-500 focus:ring-red-200"
//               : "border-gray-300 focus:ring-[#014a2f]/20"
//           }`}
//           placeholder="Enter your email address"
//         />
//         {errors.email && (
//           <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//         )}
//       </div>

//       <div>
//         <label
//           htmlFor="organization"
//           className="block text-sm font-medium text-[#014a2f] mb-1"
//         >
//           Organization
//         </label>
//         <input
//           type="text"
//           id="organization"
//           name="organization"
//           value={formData.organization}
//           onChange={handleChange}
//           className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//             errors.organization
//               ? "border-red-500 focus:ring-red-200"
//               : "border-gray-300 focus:ring-[#014a2f]/20"
//           }`}
//           placeholder="Enter your organization"
//         />
//         {errors.organization && (
//           <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
//         )}
//       </div>

//       <div>
//         <label
//           htmlFor="designation"
//           className="block text-sm font-medium text-[#014a2f] mb-1"
//         >
//           Designation
//         </label>
//         <input
//           type="text"
//           id="designation"
//           name="designation"
//           value={formData.designation}
//           onChange={handleChange}
//           className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
//             errors.designation
//               ? "border-red-500 focus:ring-red-200"
//               : "border-gray-300 focus:ring-[#014a2f]/20"
//           }`}
//           placeholder="Enter your designation"
//         />
//         {errors.designation && (
//           <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
//         )}
//       </div>

//       <div>
//         <label
//           htmlFor="signature"
//           className="block text-sm font-medium text-[#014a2f] mb-1"
//         >
//           Signature (Optional)
//         </label>
//         <div className="border rounded-md p-1 border-gray-300">
//           <div className="bg-gray-50 flex flex-col items-center border border-gray-200 rounded">
//             <div className="flex w-full p-2 bg-gray-50 justify-between">
//               <p className="text-xs text-gray-500">
//                 Sign above using finger or stylus
//               </p>
//               <button
//                 type="button"
//                 onClick={clearSignature}
//                 className="text-xs text-[#014a2f] font-medium hover:text-[#014a2f]/80"
//               >
//                 Clear
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-8">
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="w-full bg-[#014a2f] text-white py-3 flex items-center justify-center font-medium rounded-md shadow-md hover:bg-[#014a2f]/90 hover:shadow-lg transition-all"
//         >
//           {isSubmitting ? (
//             <>
//               <svg
//                 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Registering...
//             </>
//           ) : (
//             "Register for Meeting"
//           )}
//         </button>
//       </div>
//     </form>
//   );
// }
