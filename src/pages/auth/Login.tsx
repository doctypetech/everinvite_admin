import { useLogin } from "@refinedev/core";
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  Alert,
  theme,
} from "antd";
import { useState } from "react";

type LoginFormValues = {
  email: string;
  password: string;
};

export const LoginPage = () => {
  const { mutateAsync: login } = useLogin<LoginFormValues>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);

    try {
      const result = await login(values);

      if (!result.success && result.error) {
        setError(result.error.message ?? "Login failed");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error during login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: `radial-gradient(circle at top, ${token.colorBgElevated} 0%, ${token.colorBgLayout} 60%, ${token.colorBgContainer} 100%)`,
        transition: "background 0.3s ease",
      }}
    >
      <Card
        style={{
          width: 360,
          boxShadow: token.boxShadowSecondary,
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
        }}
      >
        <Typography.Title level={4} style={{ textAlign: "center", color: token.colorText }}>
          Admin Login
        </Typography.Title>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form<LoginFormValues> layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input placeholder="you@example.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password placeholder="••••••••" autoComplete="current-password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            disabled={loading}
          >
            Sign in
          </Button>
        </Form>
      </Card>
    </div>
  );
};


