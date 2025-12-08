import React from 'react';
import Layout from '@/components/layout/Layout';
import AuthForm from '@/components/auth/AuthForm';

const AuthPage: React.FC = () => {
  return (
    <Layout showNavbar={false}>
      <AuthForm />
    </Layout>
  );
};

export default AuthPage;
