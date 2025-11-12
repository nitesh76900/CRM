import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  const settingsGroups = [
    {
      title: "Lead Settings",
      description: "Recent and commonly used settings",
      settings: [
        { icon: "📦", title: "Label For", link: "/lead-for" },
        { icon: "⚫", title: "Lead Source", link: "/lead-source" },
        // { icon: "💻", title: "Lead Status", link: "/lead-status-label" },
      ],
    },
    // {
    //   title: "Role settings",
    //   description: "Manage system preferences",
    //   settings: [
    //     { icon: "🔋", title: "Block/Unblock Role", link: "/role-settings" },
    //   ],
    // },
    {
      title: "Employee Settings",
      description: "Control your Employee settings",
      settings: [
        {
          icon: "🔒",
          title: "Block/Unblock Employee",
          link: "/employee-settings",
        },
        {
          icon: "✅",
          title: "Update Employee Permissions",
          link: "/employee-permission-settings",
        },
      ],
    },
    {
      title: "Set Email Credentials Settings",
      description: "Control your Email settings",
      settings: [
        {
          icon: "📧",
          title: "Set and Update Email Credentials",
          link: "/company-email-settings",
        },
      ],
    },
    {
      title: "Attendance Settings",
      description: "Control your Attendance settings",
      settings: [
        {
          icon: "☑️",
          title: "Set and Update Attendance Settings",
          link: "/attendance-settings",
        },
        {
          icon: "✈️",
          title: "Set Holidays",
          link: "/attendance-holidays",
        },
      ],
    },
  ];

  return (
    <div className="bg-gray-100 flex flex-wrap gap-4 p-4">
      {settingsGroups.map((group, index) => (
        <div
          key={index}
          className="w-full max-w-md bg-white shadow-lg rounded-lg p-4"
        >
          <h2 className="text-lg font-semibold mb-2 cursor-pointer text-blue-600">
            {group.title}
          </h2>
          <p className="text-gray-500 text-sm mb-4">{group.description}</p>
          <div className="space-y-2">
            {group.settings.map((setting, idx) => (
              <div
                key={idx}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-200 cursor-pointer transition"
                onClick={() => navigate(setting.link)}
              >
                <span className="text-lg mr-3">{setting.icon}</span>
                <span className="text-gray-800">{setting.title}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
