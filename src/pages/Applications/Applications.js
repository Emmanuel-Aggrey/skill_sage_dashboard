import React, { useEffect, useState } from "react";
import { Table, Button, Space, notification, Modal, Tag } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import {
  acceptApplication,
  getApplicants,
  rejectApplication,
} from "../../services/applications";

const Application = () => {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(true);
    
  const openNotification = (type, message, description) => {
    api[type]({
      message,
      description,
    });
  };

  const fetchApplicants = async () => {
    try {
      const { result, success } = await getApplicants();
      console.log(success);
      if (success) {
        setApplicants([...result]);
      }
    } catch (err) {
      openNotification("error", "Network Error", err.message);
      setLoading(false)
    }finally{
      setLoading(false)
    }
    console.log(applicants);
  };

  useEffect(() => {
    fetchApplicants();
  }, [refreshData]);

  const handleDownloadResume = (resumeUrl) => {
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.target = "_blank";
    link.download = "resume.pdf";
    link.click();
  };

  const columns = [
    { title: "Job Title", dataIndex: "job_title", key: "title" },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "";
        switch (status) {
          case "accepted":
            color = "green";
            break;
          case "rejected":
            color = "red";
            break;
          case "pending":
            color = "blue";
            break;
          default:
            color = "default";
        }

        return (
          <Tag color={color} key={status}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
    },
    {
      title: "Resume",
      key: "resume",
      render: (_, applicant) =>
        applicant.resume_links.map((e) => (
          <Button
            style={{ marginRight: "10px" }}
            icon={<FilePdfOutlined />}
            onClick={() => handleDownloadResume(e)}
          >
            resume_{applicant.resume_links.indexOf(e) + 1}
          </Button>
        )),
    },
    {
      title: "Action",
      key: "action",
      render: (_, applicant) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedApplicant(applicant);
              setIsModalVisible(true);
            }}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleAccept(applicant)}
          >
            Accept
          </Button>
          <Button
            type="danger"
            icon={<CloseOutlined />}
            onClick={() => handleReject(applicant)}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  const handleAccept = async (applicant) => {
    try {
      const { success } = await acceptApplication({
        user_id: applicant.id,
        job_id: applicant.job_id,
        status: "accepted",
      });
      if (success) {
        setRefreshData(!refreshData);
        openNotification(
          "success",
          "Application Updated",
          "The application has been updated."
        );
      } else {
        openNotification("error", "Failed", "Application Failed.");
      }
    } catch (err) {
      openNotification("error", "Failed", err.message);
    }
  };

  const handleReject = async (applicant) => {
    try {
      const { success } = await rejectApplication({
        user_id: applicant.id,
        job_id: applicant.job_id,
        status: "rejected",
      });
      if (success) {
        setRefreshData(!refreshData);
        openNotification(
          "success",
          "Application Updated",
          "The application has been updated."
        );
      } else {
        openNotification("error", "Failed", "Application Failed.");
      }
    } catch (err) {
      openNotification("error", "Failed", err.message);
    }
  };

  return (
    <div>
      {contextHolder}
      <Table columns={columns} dataSource={applicants} loading={loading}/>

      {/* Modal for viewing applicant details */}
      <Modal
        title="Applicant Details"
        open={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        {selectedApplicant && (
          <div>
            {/* <p>Name: {selectedApplicant.name}</p>
            <p>Email: {selectedApplicant.email}</p>
            <p>Skills: {selectedApplicant.skills}</p> */}
            <h2>Experiences</h2>
            {selectedApplicant.experiences.map((e) => {
              return <div>
                {console.log(typeof(e))}
                <p>Title: {e.job_title}</p>
                <p>Company: {e.company_name}</p>
                <p>Remote Status: {e.is_remote}</p>
                <p>Start Date: {e.start_date}</p>
                <p>End Date: {e.end_date}</p>
                <p>Completed Status: {e.has_completed}</p>
                <p>Tasks: {e.tasks}</p>
              </div>;
            })}
            <h2>Educations</h2>
            {selectedApplicant.education.map((e) => {
              return <div>
                <p>Institution: {e.institution}</p>
                <p>Program: {e.program}</p>
                <p>Start Date: {e.start_date}</p>
                <p>End Date: {e.end_date}</p>
                <p>Completed Status: {e.has_completed}</p>
              </div>;
            })}

            {/* Include other applicant details here */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Application;
