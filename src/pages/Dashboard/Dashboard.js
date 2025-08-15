import React, { useEffect, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  VideoCameraOutlined,
  BarChartOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  Button,
  theme,
  Breadcrumb,
  Typography,
  notification,
} from "antd";
import { Courses, Jobs, ExternalJobs } from "../index";
import { useNavigate } from "react-router-dom";
import Application from "../Applications/Applications";
import { logout } from "../../services/auth";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../../redux/Slice/slice";

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const user = useSelector((state) => state.user).user;
  let key = "";
  switch (user.role) {
    case "CREATOR":
      key = "3";
      break;
    default:
      key = "1";
      break;
  }

  // useEffect(()=>{
  // // window.location.reload();
  // },[])

  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(key);
  const [api, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();

  const openNotification = (type, message, description) => {
    api[type]({
      message,
      description,
    });
  };

  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <div style={{ margin: 0 }}>
      {contextHolder}
      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        {/* Side Bar */}
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedMenuItem]}
            onSelect={({ key }) => setSelectedMenuItem(key)}
          >
            <Menu.Item key="0" label="Dashboard" disabled>
              Dashboard
            </Menu.Item>
            {(user.role === "EMPLOYER" || user.role === "ADMIN") && (
              <Menu.Item key="1" icon={<TeamOutlined />} label="Job">
                Job
              </Menu.Item>
            )}
            {(user.role === "EMPLOYER" || user.role === "ADMIN") && (
              <Menu.Item key="2" icon={<UserOutlined />} label="Applicants">
                Applicants
              </Menu.Item>
            )}
            {(user.role === "CREATOR" || user.role === "ADMIN") && (
              <Menu.Item key="3" icon={<VideoCameraOutlined />} label="Course">
                Course
              </Menu.Item>
            )}
            {user.role === "ADMIN" && (
              <Menu.Item key="4" icon={<BarChartOutlined />} label="Analytics">
                Analytics
              </Menu.Item>
            )}
            {(user.role === "EMPLOYER" || user.role === "ADMIN") && (
              <Menu.Item
                key="5"
                icon={<GlobalOutlined />}
                label="External Jobs"
              >
                External Jobs
              </Menu.Item>
            )}
          </Menu>
        </Sider>
        <Layout>
          {/* Header */}
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <span style={{ fontWeight: "bold", fontSize: "18px" }}>
              {/* Dashboard */}
              {user.name}
            </span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={async () => {
                try {
                  await logout();
                  dispatch(clearUser());
                  navigate("/");
                  openNotification("success", "logged out");
                } catch (err) {
                  openNotification("error", "Failed", err.message);
                }
              }}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
                float: "right",
              }}
            />
          </Header>
          {/* Content */}
          <Breadcrumb
            style={{
              margin: "16px 16px 0 16px",
            }}
          >
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>

            {selectedMenuItem === "1" ? (
              <Breadcrumb.Item>Job</Breadcrumb.Item>
            ) : selectedMenuItem === "3" ? (
              <Breadcrumb.Item>Course</Breadcrumb.Item>
            ) : selectedMenuItem === "2" ? (
              <Breadcrumb.Item>Applicant</Breadcrumb.Item>
            ) : selectedMenuItem === "5" ? (
              <Breadcrumb.Item>External Jobs</Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item>Analytics</Breadcrumb.Item>
            )}
          </Breadcrumb>
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              height: 200,
              background: colorBgContainer,
              overflowY: "auto",
            }}
          >
            {selectedMenuItem === "1" && <Jobs />}
            {selectedMenuItem === "2" && <Application />}
            {selectedMenuItem === "3" && <Courses />}
            {selectedMenuItem === "5" && <ExternalJobs />}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default Dashboard;
