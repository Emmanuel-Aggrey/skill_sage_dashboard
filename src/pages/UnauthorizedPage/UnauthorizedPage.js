import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import { logout } from '../../services/auth';

const UnauthorizedPage = () => {
  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      style={{margin: "auto auto"}}
      extra={
        <Link to="/">
          <Button type="primary" onClick={() => logout()}>Back Home</Button>
        </Link>
      }
    />
  );
};

export default UnauthorizedPage;
