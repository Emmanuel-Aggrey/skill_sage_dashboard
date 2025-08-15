import React, { useState, useEffect } from "react";
import { client } from "../../utils/http";

import {
  Table,
  Button,
  Space,
  notification,
  Tag,
  Input,
  Select,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ReloadOutlined,
  ExportOutlined,
  SearchOutlined,
  GlobalOutlined,
  CheckOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  scrapeExternalJobs,
  getExternalJobs,
  getRecommendedExternalJobs,
  getAllRecommendedJobs,
} from "../../services/job";

const { Option } = Select;

const ExternalJobs = () => {
  const [externalJobs, setExternalJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("external");
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [previewJob, setPreviewJob] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    loadExternalJobs();
    loadRecommendedJobs();
  }, [selectedSource]);

  const loadExternalJobs = async () => {
    setLoading(true);
    try {
      const response = await getExternalJobs(100, selectedSource);
      if (response.success) {
        setExternalJobs(response.result);
      } else {
        openNotification("error", "Error", "Failed to load external jobs");
      }
    } catch (error) {
      openNotification("error", "Error", "Failed to load external jobs");
    }
    setLoading(false);
  };

  const loadRecommendedJobs = async () => {
    try {
      const response = await getAllRecommendedJobs(50);
      if (response.success) {
        setRecommendedJobs(response.result);
      }
    } catch (error) {
      console.error("Failed to load recommended jobs:", error);
    }
  };

  const handleScrapeJobs = async () => {
    setScraping(true);
    try {
      const response = await scrapeExternalJobs();
      if (response.success) {
        openNotification(
          "success",
          "Jobs Scraped",
          response.result || "Successfully scraped external jobs"
        );
        loadExternalJobs();
      } else {
        openNotification("error", "Error", "Failed to scrape jobs");
      }
    } catch (error) {
      openNotification("error", "Error", "Failed to scrape jobs");
    }
    setScraping(false);
  };

  const openNotification = (type, message, description) => {
    api[type]({
      message,
      description,
    });
  };

  const handleEnableJob = async (jobId) => {
    try {
      const response = await client.post(`/user/external_jobs/${jobId}/enable`);
      const data = response.data;

      if (data.success) {
        openNotification("success", "Success", "Job enabled successfully");
        loadExternalJobs();
      } else {
        openNotification(
          "error",
          "Error",
          data.error || "Failed to enable job"
        );
      }
    } catch (error) {
      openNotification("error", "Error", "Failed to enable job");
    }
  };

  const handleDisableJob = async (jobId) => {
    try {
      const response = await fetch(`/user/external_jobs/${jobId}/disable`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.success) {
        openNotification("success", "Success", "Job disabled successfully");
        loadExternalJobs();
      } else {
        openNotification(
          "error",
          "Error",
          data.error || "Failed to disable job"
        );
      }
    } catch (error) {
      openNotification("error", "Error", "Failed to disable job");
    }
  };

  const handleBulkEnable = async () => {
    if (selectedJobs.length === 0) {
      openNotification("warning", "Warning", "Please select jobs to enable");
      return;
    }

    try {
      const response = await client.post("/user/external_jobs/bulk_enable", {
        job_ids: selectedJobs,
      });

      const data = response.data;

      if (data.success) {
        openNotification("success", "Success", data.result);
        setSelectedJobs([]);
        loadExternalJobs();
      } else {
        openNotification(
          "error",
          "Error",
          data.error || "Failed to enable jobs"
        );
      }
    } catch (error) {
      openNotification("error", "Error", "Failed to enable jobs");
    }
  };

  const handlePreviewJob = (job) => {
    setPreviewJob(job);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewJob(null);
  };

  const getSourceColor = (source) => {
    const colors = {
      StackOverflow: "blue",
      "We Work Remotely": "green",
      "Remote OK": "orange",
      Greenhouse: "purple",
      Internal: "gold",
    };
    return colors[source] || "default";
  };

  const filteredJobs = externalJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchText.toLowerCase()) ||
      job.company.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredRecommendedJobs = recommendedJobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchText.toLowerCase()) ||
      job.company.toLowerCase().includes(searchText.toLowerCase())
  );

  const externalJobColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.company}
          </div>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: 120,
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 120,
      render: (source) => <Tag color={getSourceColor(source)}>{source}</Tag>,
    },
    {
      title: "Skills",
      dataIndex: "skills",
      key: "skills",
      width: 200,
      render: (skills) => (
        <div>
          {skills?.slice(0, 3).map((skill, index) => (
            <Tag key={index} size="small">
              {skill}
            </Tag>
          ))}
          {skills?.length > 3 && <Tag size="small">+{skills.length - 3}</Tag>}
        </div>
      ),
    },
    {
      title: "Salary",
      key: "salary",
      width: 120,
      render: (_, record) => {
        if (record.salary_min && record.salary_max) {
          return `$${record.salary_min.toLocaleString()} - $${record.salary_max.toLocaleString()}`;
        } else if (record.salary_min) {
          return `$${record.salary_min.toLocaleString()}+`;
        }
        return "Not specified";
      },
    },
    {
      title: "Posted",
      dataIndex: "posted_date",
      key: "posted_date",
      width: 100,
      render: (date) => {
        if (!date) return "Unknown";
        const postDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - postDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays}d ago`;
      },
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      render: (_, record) => (
        <Tag color={record.is_enabled ? "green" : "red"}>
          {record.is_enabled ? "Enabled" : "Disabled"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handlePreviewJob(record)}
          >
            Preview
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<ExportOutlined />}
            onClick={() => window.open(record.apply_url, "_blank")}
          >
            Apply
          </Button>
          {record.is_enabled ? (
            <Button
              size="small"
              danger
              onClick={() => handleDisableJob(record.id)}
            >
              Disable
            </Button>
          ) : (
            <Button
              size="small"
              type="primary"
              onClick={() => handleEnableJob(record.id)}
            >
              Enable
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const recommendedJobColumns = [
    ...externalJobColumns.slice(0, -1),
    {
      title: "Match Score",
      dataIndex: "match_score",
      key: "match_score",
      width: 100,
      render: (score) => (
        <Tag color={score >= 80 ? "green" : score >= 60 ? "orange" : "red"}>
          {score}%
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<ExportOutlined />}
          onClick={() => {
            if (record.apply_url) {
              window.open(record.apply_url, "_blank");
            } else {
              openNotification(
                "info",
                "Internal Job",
                "This is an internal job posting"
              );
            }
          }}
        >
          {record.is_external ? "Apply" : "View"}
        </Button>
      ),
    },
  ];

  const sources = [
    "StackOverflow",
    "We Work Remotely",
    "Remote OK",
    "Greenhouse",
  ];

  return (
    <div style={{ padding: "20px" }}>
      {contextHolder}

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: "20px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total External Jobs"
              value={externalJobs.length}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Recommended Jobs"
              value={recommendedJobs.length}
              prefix={<SearchOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Job Sources" value={sources.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Remote Jobs"
              value={
                externalJobs.filter((job) =>
                  job.location.toLowerCase().includes("remote")
                ).length
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          loading={scraping}
          onClick={handleScrapeJobs}
        >
          Scrape New Jobs
        </Button>

        {selectedJobs.length > 0 && (
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleBulkEnable}
          >
            Enable Selected ({selectedJobs.length})
          </Button>
        )}

        <Select
          placeholder="Filter by source"
          style={{ width: 200 }}
          allowClear
          value={selectedSource}
          onChange={setSelectedSource}
        >
          {sources.map((source) => (
            <Option key={source} value={source}>
              {source}
            </Option>
          ))}
        </Select>

        <Input.Search
          placeholder="Search jobs..."
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div style={{ marginLeft: "auto" }}>
          <Button.Group>
            <Button
              type={activeTab === "external" ? "primary" : "default"}
              onClick={() => setActiveTab("external")}
            >
              All External Jobs ({filteredJobs.length})
            </Button>
            <Button
              type={activeTab === "recommended" ? "primary" : "default"}
              onClick={() => setActiveTab("recommended")}
            >
              Recommended Jobs ({filteredRecommendedJobs.length})
            </Button>
          </Button.Group>
        </div>
      </div>

      {/* Jobs Table */}
      <Table
        columns={
          activeTab === "external" ? externalJobColumns : recommendedJobColumns
        }
        dataSource={
          activeTab === "external" ? filteredJobs : filteredRecommendedJobs
        }
        rowKey="id"
        loading={loading}
        rowSelection={
          activeTab === "external"
            ? {
                selectedRowKeys: selectedJobs,
                onChange: setSelectedJobs,
                getCheckboxProps: (record) => ({
                  disabled: record.is_enabled, // Disable checkbox for already enabled jobs
                }),
              }
            : undefined
        }
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} jobs`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Job Preview Modal */}
      {previewJob && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: previewVisible ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closePreview}
        >
          <div
            style={{
              width: "90%",
              height: "90%",
              backgroundColor: "white",
              borderRadius: "8px",
              overflow: "hidden",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#fafafa",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{previewJob.title}</h3>
                <p style={{ margin: 0, color: "#666" }}>
                  {previewJob.company} - {previewJob.location}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  onClick={() => window.open(previewJob.apply_url, "_blank")}
                >
                  Apply on Site
                </Button>
                <Button onClick={closePreview}>Close</Button>
              </div>
            </div>

            {/* Iframe Content */}
            <div style={{ height: "calc(100% - 80px)" }}>
              <iframe
                src={previewJob.apply_url}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                title={`Preview: ${previewJob.title}`}
                onError={() => {
                  // Handle iframe loading errors
                  console.error("Failed to load iframe");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalJobs;
