import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, Card, notification } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "./Login.css";
import { login } from "../../services/auth";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo.jpeg";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/Slice/slice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (type, message, description) => {
    api[type]({
      message,
      description,
    });
  };

  const errorFlattener = (error) => {
    let err = "";
    error.errorFields.forEach((element) => {
      err += `${element.errors}\n`;
    });
    return err;
  };

  const onFinish = async (values) => {
    setIsLoading(true);
    console.log("Received values:", values);
    try {
      const { success, result } = await login(values);
      if (success) {
        localStorage.setItem("token", result.token);
        dispatch(setUser(result));

        setIsLoading(false);
        openNotification("success", "Logged in", "Logged in Successfully!");
        // onComplete();
        // navigate("/dashboard");
        window.location.href="/dashboard";
        // setTimeout(() => {
          
        // }, 1);
      } else {
        setIsLoading(false);
        openNotification("error", "login failed", "unable to login");
      }
    } catch (e) {
      setIsLoading(false);
      openNotification(
        "error",
        "login failed",
        `${e.message}\n Kindly alert the admin of this issue`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    setIsLoading(false);
    console.log("Failed:", errorInfo.errorFields[0].errors);
    openNotification("error", "login failed", errorFlattener(errorInfo));
  };

  return (
    <div className="login-container">
      {contextHolder}
      <Card className="login-card">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img src={Logo} alt="skill sage" height={70} width={70} />
          <span style={{ fontSize: "20px", fontWeight: "bold" }}>
            Skill Sage
          </span>
        </div>
        <br />
        <Form
          name="normal_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "please input your email!" }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "please input your password!" }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={isLoading}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
