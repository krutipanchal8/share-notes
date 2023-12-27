import React, { useState } from "react";
import { Modal, Form, Upload, message, Input } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import axios from "axios";

const UploadFileModal = ({ handleCancel, parentId, backendUrl }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [pdfBase64, setPdfBase64] = useState(null);

  const handleOk = () => {
    form
      .validateFields()
      .then(async(values) => {
        console.log(values);
        if (fileList.length === 0) {
          message.error("Please upload the PDF file!");
          return;
        }
        await axios.post(
          `${backendUrl}/file`,
          {
            fileName: values.fileName,
            file: pdfBase64,
            parentId: parentId,
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
        if (fileList.length === 0) {
          message.error("Please upload the PDF file!");
        }
      });
  };

  const handleUpload = (file) => {
    const isPdf = file.type === "application/pdf";
    if (!isPdf) {
      message.error("You can only upload PDF files!");
      setFileList([]);
      return false;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("PDF must smaller than 2MB!");
      setFileList([]);
      return false;
    }

    const currentFileList = form.getFieldValue("upload");
    if (currentFileList && currentFileList.length > 0) {
      message.error("You can only upload 1 file!");
      setFileList([]);
      return false;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPdfBase64(reader.result);
    };

    setFileList([file]);

    return isPdf && isLt2M;
  };

  console.log(fileList);

  return (
    <Modal
      title="Upload File"
      visible={true}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="fileName"
          rules={[
            { required: true, message: "Please input the name of the file!" },
          ]}
        >
          <Input placeholder="File Name" />
        </Form.Item>
        <Form.Item
          name="upload"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e && e.fileList;
          }}
          rules={[{ required: true, message: "Please upload the PDF file!" }]}
        >
          <Upload.Dragger
            name="file"
            multiple={false}
            fileList={fileList}
            beforeUpload={handleUpload}
            maxCount={1}
            onRemove={() => setFileList([])}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single upload. Strictly prohibit from uploading
              company data or other band files
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadFileModal;
