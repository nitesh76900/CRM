import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from 'xlsx';
import { getCompanyInfo } from "../../services/superAdminServices";

const CompanyDetails = () => {
  const { id } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Company Details
  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await getCompanyInfo(id);
      console.log(response)
      
      if (response?.data) {
        setCompanyData(response.data);
      } else {
        setError("No company data found");
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
      setError(err?.response?.data.message || "Failed to fetch company details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  // Comprehensive Data Export
  const downloadAllData = () => {
    if (!companyData) {
      alert("No company data available to download.");
      return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // 1. Company Details Sheet
    const companyDetailsData = [
      ["Company Information"],
      ["Field", "Value"],
      ["Name", companyData.company.name],
      ["Industry", companyData.company.industry],
      ["Phone", companyData.company.phoneNo],
      ["Email", companyData.company.email],
      ["Verification Status", companyData.company.verify],
      ["Address", `${companyData.company.address?.city}, ${companyData.company.address?.state}, ${companyData.company.address?.country} - ${companyData.company.address?.pincode}`],
      ["Owner Name", companyData.owner.name],
      ["Owner Email", companyData.owner.email]
    ];
    const companyDetailsSheet = XLSX.utils.aoa_to_sheet(companyDetailsData);
    XLSX.utils.book_append_sheet(wb, companyDetailsSheet, "Company Details");

    // 2. Employees Sheet
    if (companyData.employees?.list && companyData.employees.list.length > 0) {
      const employeesData = [
        ["Employees Summary"],
        ["Total Employees", companyData.employees.totalEmployees],
        ["Active Employees", companyData.employees.totalActiveEmployees],
        ["Inactive Employees", companyData.employees.totalInactiveEmployees],
        ["Verified Employees", companyData.employees.totalVerifiedEmployees],
        [],
        ["Name", "Designation", "Email", "Phone", "Status", "Verified"]
      ];

      companyData.employees.list.forEach(emp => {
        employeesData.push([
          emp.user?.name || 'N/A',
          emp.designation || 'N/A',
          emp.user?.email || 'N/A',
          emp.user?.phoneNo || 'N/A',
          emp.isActive ? "Active" : "Inactive",
          emp.verify ? "Yes" : "No"
        ]);
      });

      const employeesSheet = XLSX.utils.aoa_to_sheet(employeesData);
      XLSX.utils.book_append_sheet(wb, employeesSheet, "Employees");
    }

    // 3. Contacts Sheet
    if (companyData.contacts && companyData.contacts.length > 0) {
      const contactsData = [
        ["Contacts"],
        ["Total Contacts", companyData.contacts.length],
        [],
        ["Name", "Phone", "Email", "Address", "Business Card"]
      ];

      companyData.contacts.forEach(contact => {
        contactsData.push([
          contact.name || 'N/A',
          contact.phoneNo || 'N/A',
          contact.email || 'N/A',
          `${contact.address?.city || 'N/A'}, ${contact.address?.state || 'N/A'} - ${contact.address?.pincode || 'N/A'}`,
          contact.businessCard?.url || 'No Business Card'
        ]);
      });

      const contactsSheet = XLSX.utils.aoa_to_sheet(contactsData);
      XLSX.utils.book_append_sheet(wb, contactsSheet, "Contacts");
    }

    // 4. Leads Sheet
    if (companyData.leads && companyData.leads.length > 0) {
      const leadsData = [
        ["Leads"],
        ["Total Leads", companyData.leads.length],
        [],
        [
          "Title", "Status", "Contact Name", "Contact Phone", 
          "Source", "For", "Remark", "Reference Name", 
          "Reference Phone", "Follow-ups Count"
        ]
      ];

      companyData.leads.forEach(lead => {
        leadsData.push([
          lead.title || 'N/A',
          lead.status || 'N/A',
          lead.contact?.name || 'N/A',
          lead.contact?.phoneNo || 'N/A',
          lead.source?.name || 'N/A',
          lead.for?.name || 'N/A',
          lead.remark || 'N/A',
          lead.reference?.name || 'N/A',
          lead.reference?.phoneNo || 'N/A',
          lead.followUpsCount || 0
        ]);
      });

      const leadsSheet = XLSX.utils.aoa_to_sheet(leadsData);
      XLSX.utils.book_append_sheet(wb, leadsSheet, "Leads");
    }

    // Save the workbook
    XLSX.writeFile(wb, `${companyData.company.name || 'Company'}_Comprehensive_Details.xlsx`);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  // No Data State
  if (!companyData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-xl">No company data available</p>
      </div>
    );
  }

  // Main Render
  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      {/* Download Button */}
      <div className="mb-6 flex justify-end">
        <button 
          onClick={downloadAllData}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded shadow-md transition duration-300 ease-in-out transform"
        >
          Download All Company Data (XLSX)
        </button>
      </div>

      {/* Company Details Section */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Company Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Name: <span className="text-gray-600">{companyData.company.name}</span></p>
            <p className="font-semibold">Industry: <span className="text-gray-600">{companyData.company.industry}</span></p>
            <p className="font-semibold">Phone: <span className="text-gray-600">{companyData.company.phoneNo}</span></p>
          </div>
          <div>
            <p className="font-semibold">Email: <span className="text-gray-600">{companyData.company.email}</span></p>
            <p className="font-semibold">Verification Status: 
              <span className={`${companyData.company.verify === 'Verify' ? 'text-green-600' : 'text-red-600'}`}>
                {companyData.company.verify === 'Verify' ? 'Verified' : 'Not Verified'}
              </span>
            </p>
            <p className="font-semibold">Address: 
              <span className="text-gray-600">
                {companyData.company.address?.city}, 
                {companyData.company.address?.state}, 
                {companyData.company.address?.country} - 
                {companyData.company.address?.pincode}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Employees Section */}
      {companyData.employees?.list && companyData.employees.list.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Employees ({companyData.employees.totalEmployees})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Designation</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {companyData.employees.list.map((emp) => (
                  <tr key={emp._id} className="border-b hover:bg-gray-100">
                    <td className="p-2 border">{emp.user?.name}</td>
                    <td className="p-2 border">{emp.designation}</td>
                    <td className="p-2 border">{emp.user?.email}</td>
                    <td className="p-2 border">{emp.user?.phoneNo}</td>
                    <td className="p-2 border">
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contacts Section */}
      {companyData.contacts && companyData.contacts.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Contacts ({companyData.contacts.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Address</th>
                </tr>
              </thead>
              <tbody>
                {companyData.contacts.map((contact) => (
                  <tr key={contact._id} className="border-b hover:bg-gray-100">
                    <td className="p-2 border">{contact.name}</td>
                    <td className="p-2 border">{contact.phoneNo}</td>
                    <td className="p-2 border">{contact.email}</td>
                    <td className="p-2 border">
                      {contact.address?.city}, {contact.address?.state} - 
                      {contact.address?.pincode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leads Section */}
      {companyData.leads && companyData.leads.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            Leads ({companyData.leads.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Contact</th>
                  <th className="p-2 border">Source</th>
                  <th className="p-2 border">Remark</th>
                  <th className="p-2 border">Follow-ups</th>
                </tr>
              </thead>
              <tbody>
                {companyData.leads.map((lead) => (
                  <tr key={lead._id} className="border-b hover:bg-gray-100">
                    <td className="p-2 border">{lead.title}</td>
                    <td className="p-2 border">{lead.status}</td>
                    <td className="p-2 border">
                      {lead.contact?.name}<br />
                      {lead.contact?.phoneNo}
                    </td>
                    <td className="p-2 border">{lead.source?.name}</td>
                    <td className="p-2 border">{lead.remark}</td>
                    <td className="p-2 border">{lead.followUpsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDetails;