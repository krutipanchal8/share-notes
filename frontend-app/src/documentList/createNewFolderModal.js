import React from "react";
import { Modal, Form, Input } from "antd";
import axios from "axios";

const CreateFoldarModal = ({ handleCancel, parentId, backendUrl }) => {
  const [form] = Form.useForm();
  const handleOk =  () => {
    // Validate and fetch the values from the form
    form
      .validateFields()
      .then(async (values) => {
        console.log(values);
        await axios.post(
          `${backendUrl}/folder`,
          {
            parentId,
            folderName: values.folderName,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods":
                "GET,PUT,POST,DELETE,PATCH,OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Allow-Credentials": "true",
            },
          }
        );
        form.resetFields();
        handleCancel();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <Modal
      title="Create New Folder"
      visible={true}
      onOk={() => handleOk()}
      onCancel={() => handleCancel()}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="folderName"
          rules={[
            { required: true, message: "Please input the name of the folder!" },
          ]}
        >
          <Input placeholder="Folder Name" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateFoldarModal;
