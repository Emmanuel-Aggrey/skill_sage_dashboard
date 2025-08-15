import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Typography,
  Button,
  Space,
  Modal,
  Row,
  Col,
  notification,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./Job.css";
import { addJob, getJobs, removeJob, updateJob } from "../../services/job";

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  children,
  ...restProps
}) => {
  const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const Jobs = () => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm();
  setSearchText(selectedKeys[0]);
  setSearchedColumn(dataIndex);
};

const handleReset = (clearFilters) => {
  clearFilters();
  setSearchText("");
};

const getColumnSearchProps = (dataIndex, columnTitle) => ({
  filterDropdown: ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder={`Search ${columnTitle}`}
        value={selectedKeys[0]}
        onChange={(e) =>
          setSelectedKeys(e.target.value ? [e.target.value] : [])
        }
        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
        style={{ width: 188, marginBottom: 8, display: "block" }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Search
        </Button>
        <Button
          onClick={() => handleReset(clearFilters)}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered) => (
    <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
  ),
  onFilter: (value, record) =>
    record[dataIndex]
      ? record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      : "",
  onFilterDropdownVisibleChange: (visible) => {
    if (visible) {
      setTimeout(() => searchInput.select(), 100);
    }
  },
  render: (text) =>
    searchedColumn === dataIndex ? (
      <Highlighter
        highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
        searchWords={[searchText]}
        autoEscape
        textToHighlight={text ? text.toString() : ""}
      />
    ) : (
      text
    ),
});


  const openNotification = (type, message, description) => {
    api[type]({
      message,
      description,
    });
  };

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      title: record.title,
      location: record.location,
      expiry: new Date(record.expiry),
      salary: record.salary,
      type: record.type,
      position: record.position,
      requirements: record.requirements.join(", "),
      skills: record.skills.join(", "),
      description: record.description,
      image: record.image,
    });
    setEditingKey(record.id);
  };

  const clearForm = () => {
    form.resetFields();
  };

  const handleExpand = (expanded, record) => {
    if (!expanded) {
      const newExpandedRows = expandedRows.filter((key) => key !== record.id);
      setExpandedRows(newExpandedRows);
    } else {
      clearForm();
      setExpandedRows([...expandedRows, record.id]);
    }
  };

  const fetchJobs = async () => {
    try {
      const { success, result } = await getJobs();
      if (success) {
        setJobs(result);
        setFilterData(result);
      }
    } catch (errInfo) {
      openNotification("error", "Error", errInfo.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [refreshData]);

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const updatedJob = {
        id: key,
        title: row.title,
        location: row.location,
        expiry: new Date(row.expiry).getDate(),
        salary: row.salary,
        type: row.type,
        position: row.position,
        requirements: row.requirements
          ? row.requirements.split(", ").filter(Boolean)
          : [],
        skills: row.skills ? row.skills.split(", ").filter(Boolean) : [],
        description: row.description,
        image: row.image,
      };

      const { success } = await updateJob(updatedJob);

      if (success) {
        setRefreshData(!refreshData);
        cancel();
        openNotification(
          "success",
          "Job Updated",
          "The job has been successfully updated."
        );
      } else {
        openNotification("error", "Update Failed", "Unable to update the job");
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
      openNotification("error", "Error", errInfo.message);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const errorFlattener = (error) => {
    let err = "";
    error.errorFields.forEach((element) => {
      err += `${element.errors}\n`;
    });
    return err;
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        const requirements = values.requirements
          ? values.requirements.split(", ").filter(Boolean)
          : [];
        const skills = values.skills
          ? values.skills.split(", ").filter(Boolean)
          : [];

        const jobData = {
          ...values,
          expiry: values.expiry,
          requirements: requirements,
          skills: skills,
        };
        try {
          const { result, success } = await addJob(jobData);
          console.log(result);
          if (success) {
            setRefreshData(!refreshData);
            form.resetFields();
            setIsModalVisible(false);
            openNotification(
              "success",
              "Job Added",
              "The job has been successfully added."
            );
          } else {
            openNotification(
              "error",
              "Add Job Failed",
              "Unable to add the job"
            );
          }
        } catch (errInfo) {
          openNotification("error", "Error", errInfo.request.error);
        }
      })
      .catch((errorInfo) => {
        console.log("Validate Failed:", errorInfo);
        openNotification("error", "Error", errorFlattener(errorInfo));
      });
  };

  const handleDelete = async (id) => {
    try {
      const { success } = await removeJob(id);
      if (success) {
        setRefreshData(!refreshData);
        openNotification(
          "success",
          "Job Deleted",
          "The job has been successfully deleted."
        );
      } else {
        openNotification("error", "Delete Failed", "Unable to delete the job");
      }
    } catch (errInfo) {
      openNotification("error", "Error", errInfo.message);
    }
  };

  const onSelectChange = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      width: "15%",
      render: (text, record) => renderCell(text, record, "title"),
    },
    {
      title: "Company",
      dataIndex: "company",
      width: "10%",
      render: (text, record) => renderCell(text, record, "company"),
    },
    {
      title: "Location",
      dataIndex: "location",
      width: "10%",
      render: (text, record) => renderCell(text, record, "location"),
    },
    {
      title: "Expiry",
      dataIndex: "expiry",
      width: "10%",
      render: (text, record) => renderCell(text, record, "expiry"),
    },
    {
      title: "Salary",
      dataIndex: "salary",
      width: "10%",
      render: (text, record) => renderCell(text, record, "salary"),
    },
    // {
    //   title: "Description",
    //   dataIndex: "description",
    //   width: "20%",
    //   render: (text, record) => renderCell(text, record, "description"),
    // },
    {
      title: "Type",
      dataIndex: "type",
      width: "10%",
      render: (text, record) => renderCell(text, record, "type"),
    },
    {
      title: "Position",
      dataIndex: "position",
      width: "10%",
      render: (text, record) => renderCell(text, record, "position"),
    },
    {
      title: "Action",
      dataIndex: "operation",
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <Space>
            {editable ? (
              <>
                <Typography.Link onClick={() => save(record.id)}>
                  <CheckOutlined />
                </Typography.Link>
                <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
                  <a>
                    <CloseOutlined />
                  </a>
                </Popconfirm>
              </>
            ) : (
              <>
                <Typography.Link
                  disabled={editingKey !== ""}
                  onClick={() => edit(record)}
                >
                  <EditOutlined />
                </Typography.Link>
                <Popconfirm
                  title="Sure to delete?"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <a>
                    <DeleteOutlined />
                  </a>
                </Popconfirm>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const renderCell = (text, record, dataIndex) => {
    const editing = isEditing(record);
    return (
      <td>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${dataIndex}!`,
              },
            ]}
          >
            <Input />
          </Form.Item>
        ) : (
          text
        )}
      </td>
    );
  };

  const expandedRowRender = (record) => {
    const isThisRowExpanded = expandedRows.includes(record.id);
    return isThisRowExpanded ? (
      <Form form={form} initialValues={{ ...record }}>
        {/* Render additional form fields or details here */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Requirements" name="requirements">
              <Input.TextArea />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Skills" name="skills">
              <Input.TextArea />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Image" name="image">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    ) : null;
  };

  const onSearch = (value) => {
    const filteredData = jobs.filter((job) =>
      job.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilterData(filteredData);
  };

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  return (
    <div className="job-wrapper">
      {contextHolder}
      <div className="job-btn-wrapper">
        <Button size="middle" className="job-btn" onClick={showModal}>
          <PlusOutlined />
          Add Job
        </Button>
        <Space></Space>
        <Popconfirm
          title="Sure to delete?"
          onConfirm={() => handleDelete(selectedRowKeys[0])}
        >
          <Button
            size="middle"
            className="job-btn"
            disabled={selectedRowKeys.length !== 1}
          >
            <DeleteOutlined />
            Delete
          </Button>
        </Popconfirm>
      </div>

      <Input.Search
        placeholder="Search by title"
        onSearch={onSearch}
        style={{ width: 200, marginBottom: 16 }}
      />

      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={filterData}
          columns={columns}
          rowClassName="editable-row"
          onChange={onChange}
          expandable={{
            rowExpandable: (record) => record.title !== "Not Expandable",
            expandedRowRender,
            onExpand: handleExpand,
          }}
          rowSelection={rowSelection}
          loading={loading}
        />

        <Modal
          title="Add Job"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          form={form}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[
                  { required: true, message: "Please input the job title!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Location"
                name="location"
                rules={[
                  { required: true, message: "Please input the job location!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Expiry"
                name="expiry"
                rules={[
                  {
                    required: true,
                    message: "Please input the job expiry date!",
                  },
                ]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Salary"
                name="salary"
                rules={[
                  { required: true, message: "Please input the job salary!" },
                ]}
              >
                <InputNumber />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Type"
                name="type"
                rules={[
                  { required: true, message: "Please input the job type!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Position"
                name="position"
                rules={[
                  { required: true, message: "Please input the job position!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Company"
                name="company"
                rules={[
                  { required: true, message: "Please input the company!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Image" name="image">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input the job description!" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Requirements" name="requirements">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Skills" name="skills">
            <Input.TextArea />
          </Form.Item>
        </Modal>
      </Form>
    </div>
  );
};

export default Jobs;
