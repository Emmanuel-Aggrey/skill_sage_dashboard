import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Popconfirm,
  Table,
  Typography,
  Button,
  Space,
  Modal,
  Row,
  Col,
  notification,
  InputNumber,
  Tag,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./Course.css"; // Create a Course.css file for styling if needed
import {
  addCourse,
  getCourses,
  removeCourse,
  updateCourse,
  addSession,
  addItem,
  removeItem,
  removeSession, // Add your service function for adding sessions here
} from "../../services/course";

const SessionForm = ({ visible, onCreate, onCancel, id }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      open={visible}
      title="Add Session"
      okText="Add"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onCreate(values, id);
            form.resetFields();
          })
          .catch((errorInfo) => {
            console.log("Validation failed:", errorInfo);
          });
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Session Name"
          rules={[
            {
              required: true,
              message: "Please enter the session name",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="video"
          label="Video URL"
          rules={[
            {
              required: true,
              message: "Please enter the video URL",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="time" label="Time">
          <Input />
        </Form.Item>
        {/* You can add more form fields as needed */}
      </Form>
    </Modal>
  );
};

const ItemForm = ({ visible, onCreate, onCancel, id }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      open={visible}
      title="Add Item"
      okText="Add"
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onCreate(values, id);
            form.resetFields();
          })
          .catch((errorInfo) => {
            console.log("Validation failed:", errorInfo);
          });
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Item Name"
          rules={[
            {
              required: true,
              message: "Please enter the item name",
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

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

const Courses = () => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [sessionForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (type, message, description) => {
    api[type]({
      message,
      description,
    });
  };

  const showSessionModal = () => {
    setIsSessionModalVisible(true);
  };

  const showItemModal = () => {
    setIsItemModalVisible(true);
  };

  const handleSessionCreate = async (values, id) => {
    const sessionData = {
      name: values.name,
      video: values.video,
      item_id: id,
    };

    console.log("Received values:", sessionData);

    try {
      const { result, success } = await addSession(sessionData);
      if (success) {
        setRefreshData(!refreshData);
        sessionForm.resetFields();
        setIsSessionModalVisible(false);
        openNotification(
          "success",
          "Session Added",
          "The session has been successfully added."
        );
      } else {
        openNotification(
          "error",
          "Add Session Failed",
          "Unable to add the session"
        );
      }
    } catch (errInfo) {
      openNotification("error", "Error", errInfo.message);
    }

    setIsSessionModalVisible(false);
  };

  const handleItemCreate = async (values, id) => {
    const itemData = {
      name: values.name,
      course_id: id,
    };

    console.log("Received values:", itemData);

    try {
      const { result, success } = await addItem(itemData);
      if (success) {
        setRefreshData(!refreshData);
        sessionForm.resetFields();
        setIsSessionModalVisible(false);
        openNotification(
          "success",
          "Item Added",
          "The item has been successfully added."
        );
      } else {
        openNotification("error", "Add Item Failed", "Unable to add the item");
      }
    } catch (errInfo) {
      openNotification("error", "Error", errInfo.message);
    }

    setIsItemModalVisible(false);
  };

  // Function to handle session form cancellation
  const handleSessionCancel = () => {
    form.resetFields();
    setIsSessionModalVisible(false);
  };

  const handleItemCancel = () => {
    form.resetFields();
    setIsItemModalVisible(false);
  };

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      // Set form values for editing
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

  const fetchCourses = async () => {
    try {
      const { success, result } = await getCourses();
      if (success) {
        setCourses(result);
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
    fetchCourses();
  }, [refreshData]);

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (id) => {
    try {
      const row = await form.validateFields();
      console.log(row.requirements);
      console.log(row.skills);
      console.log(row.lessons);
      const requirements =
      row.requirements && typeof row.requirements === 'string'
        ? row.requirements.split(',').map((item) => item.trim())
        : Array.isArray(row.requirements)
        ? row.requirements
        : [];
    const skills =
      row.skills && typeof row.skills === 'string'
        ? row.skills.split(',').map((item) => item.trim())
        : Array.isArray(row.skills)
        ? row.skills
        : [];
    const lessons =
      row.lessons && typeof row.lessons === 'string'
        ? row.lessons.split(',').map((item) => item.trim())
        : Array.isArray(row.lessons)
        ? row.lessons
        : [];

    const updatedCourse = {
      title: row.title,
      sub_title: row.sub_title,
      description: row.description,
      language: row.language,
      requirements: requirements,
      lessons: lessons,
      skills: skills,
      image: row.image,
      isActive: row.isActive,
    };

      const { success } = await updateCourse(updatedCourse, id);

      if (success) {
        setRefreshData(!refreshData);
        cancel();
        openNotification(
          "success",
          "Course Updated",
          "The course has been successfully updated."
        );
      } else {
        openNotification(
          "error",
          "Update Failed",
          "Unable to update the course"
        );
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
        console.log(values);
        const requirements =
          values.requirements && typeof values.requirements === "string"
            ? values.requirements.split(", ").filter(Boolean)
            : [];
        const skills =
          values.skills && typeof values.skills === "string"
            ? values.skills.split(", ").filter(Boolean)
            : [];
        const lessons =
          values.lessons && typeof values.lessons === "string"
            ? values.lessons.split(", ").filter(Boolean)
            : [];

        const courseData = {
          title: values.title,
          sub_title: values.sub_title,
          description: values.description,
          language: values.language,
          requirements: requirements,
          lessons: lessons,
          skills: skills,
          image: values.image,
          isActive: values.isActive,
        };

        try {
          const { result, success } = await addCourse(courseData);

          if (success) {
            setRefreshData(!refreshData);
            form.resetFields();
            setIsModalVisible(false);
            openNotification(
              "success",
              "Course Added",
              "The course has been successfully added."
            );
          } else {
            openNotification(
              "error",
              "Add Course Failed",
              "Unable to add the course"
            );
          }
        } catch (errInfo) {
          openNotification("error", "Error", errInfo.request.error);
        }
      })
      .catch((errorInfo) => {
        console.log("Validate Failed:", errorInfo);
        openNotification("error", "Error", errorInfo.message);
      });
  };

  const handleDelete = async (id) => {
    try {
      const { success } = await removeCourse(id);
      if (success) {
        setRefreshData(!refreshData);
        openNotification(
          "success",
          "Course Deleted",
          "The course has been successfully deleted."
        );
      } else {
        openNotification(
          "error",
          "Delete Failed",
          "Unable to delete the course"
        );
      }
    } catch (errInfo) {
      openNotification("error", "Error", errInfo.message);
    }
  };

  // course item
  const handleDeleteItem = async (id) => {
    try {
      const { success } = await removeItem(id);
      if (success) {
        setRefreshData(!refreshData);

        openNotification(
          "success",
          "Course Item Deleted",
          "The course item has been successfully deleted."
        );
      } else {
        openNotification(
          "error",
          "Delete Failed",
          "Unable to delete the course item"
        );
      }
    } catch (errInfo) {
      openNotification("error", "Error", errInfo.message);
    }
  };

  // delete session
  const handleDeleteSession = async (id) => {
    try {
      const { success } = await removeSession(id);
      if (success) {
        setRefreshData(!refreshData);
        openNotification(
          "success",
          "Session Deleted",
          "The session has been successfully deleted."
        );
      } else {
        openNotification(
          "error",
          "Delete Failed",
          "Unable to delete the session"
        );
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

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      width: "15%",
      render: (text, record) => renderCell(text, record, "title"),
    },
    {
      title: "Sub Title",
      dataIndex: "sub_title",
      width: "15%",
      render: (text, record) => renderCell(text, record, "sub_title"),
    },
    {
      title: "Languages",
      dataIndex: "language",
      width: "15%",
      render: (text, record) => renderCell(text, record, "language"),
    },
    // Define other columns here
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (status, record) => {
        let color = "";
        let stat = "";
        switch (status) {
          case true:
            color = "green";
            stat = "Active";
            break;
          case false:
            color = "red";
            stat = "Inactive";
            break;
          default:
            color = "default";
            stat = "Default";
        }

        return (
          <Tag color={color} key={status}>
            {renderCell(stat, record, "isActive")}
          </Tag>
        );
      },
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

  const deleteItem = async (id) => {
    try {
      const { success } = await removeItem(id);
      if (success) {
        openNotification(
          "success",
          "Item Deleted",
          "Successfully removed Course Item"
        );
        setRefreshData(!refreshData);
      } else {
        openNotification("error", "Failed", "Deletion Failed");
      }
    } catch (err) {
      openNotification("error", "Network Error", err.message);
    }
  };

  const expandedRowRender = (record) => {
    const isThisRowExpanded = expandedRows.includes(record.id);

    return isThisRowExpanded ? (
      <Form form={form} initialValues={{ ...record }}>
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
          <Col span={12}>
            <Form.Item label="Lessons" name="lessons">
              <Input.TextArea />
            </Form.Item>
          </Col>
        </Row>

        {record.items.map((e) => (
          <div key={e.id} style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "20px", fontWeight: "bold" }}>
              {e.name}
            </span>
            <Button
              // type="primary"
              onClick={() => deleteItem(e.id)}
              style={{ float: "right" }}
            >
              <DeleteOutlined /> Delete Item
            </Button>
            <Button
              // type="primary"
              onClick={showSessionModal}
              style={{ float: "right" }}
            >
              <PlusOutlined /> Add Session
            </Button>
            <Table
              dataSource={e.sessions}
              columns={sessionColumns}
              pagination={false}
            />
            <SessionForm
              visible={isSessionModalVisible}
              onCreate={handleSessionCreate}
              onCancel={handleSessionCancel}
              id={e.id}
            />
          </div>
        ))}
        <ItemForm
          visible={isItemModalVisible}
          onCreate={handleItemCreate}
          onCancel={handleItemCancel}
          id={record.id}
        />
        <Button
          // type="primary"
          onClick={showItemModal}
          style={{ marginTop: "10px" }}
        >
          <PlusOutlined /> Add Item
        </Button>
      </Form>
    ) : null;
  };

  const sessionColumns = [
    {
      title: "Session Name",
      dataIndex: "name",
    },
    {
      title: "Video",
      dataIndex: "video",
    },
    {
      title: "Action",
      render: (_, session) => {
        return (
          <Space>
            {/* Edit Course Item */}
            <a>Edit</a>

            {/* Delete Course Item */}
            <Popconfirm
              title="Are you sure you want to delete this course item?"
              onConfirm={() => handleDeleteSession(session.id)}
            >
              <a>Delete</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const onSearch = (value) => {
    // Your search logic here
  };

  return (
    <div className="course-wrapper">
      {contextHolder}
      <div className="course-btn-wrapper">
        <Button type="primary" onClick={showModal}>
          <PlusOutlined /> Add Course
        </Button>
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
          title="Add Course"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          form={form}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                message: "Please input the title!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Sub Title"
            name="sub_title"
            rules={[
              {
                required: true,
                message: "Please input the sub title!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please input the description!",
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Language" name="language">
            <Input />
          </Form.Item>
          <Form.Item label="Requirements" name="requirements">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Lessons" name="lessons">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Skills" name="skills">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Image" name="image">
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="isActive" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Modal>
      </Form>
    </div>
  );
};

export default Courses;
