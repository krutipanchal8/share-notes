import React, { useEffect, useState } from "react";
import { Tree, Space, Input, Divider, Layout } from "antd";
import { FolderOpenOutlined, FileOutlined } from "@ant-design/icons";
import MyPdfViewer from "./renderDoc";
import CreateFoldarModal from "./createNewFolderModal";
import UplaodFileModal from "./uplaodFileModal";
import axios from "axios";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Sider, Content } = Layout;

const FolderStructure = () => {
  let navigate = useNavigate();
  const [folderStructure, setFolderStructure] = useState([]);
  const [filePath, setFilePath] = useState();
  const [backendUrl, setBackendUrl] = useState();
  const [searchText, setSearchText] = useState();
  const [isModalVisible, setIsModalVisible] = useState();
  const [parentFolderId, setParentFolderId] = useState(null);

  useEffect(() => {
    fetchBackendURL();
    axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
    axios.defaults.headers.common["Access-Control-Allow-Methods"] =
      "GET,PUT,POST,DELETE,PATCH,OPTIONS";
    axios.defaults.headers.common["Access-Control-Allow-Headers"] =
      "Content-Type";
    axios.defaults.headers.common["Access-Control-Allow-Credentials"] = "true";
    axios.defaults.headers.common["Content-Type"] = "application/json";
  }, []);

  useEffect(() => {
    filePath && window.location.assign(filePath);
  }, [filePath]);

  useEffect(() => {
    backendUrl && fetchData();
  }, [backendUrl, searchText]);

//   const downDoc = async (filePath) => {
//     const res = await axios({
//       url: filePath,
//       method: "GET",
//       responseType: "blob",
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//         "Access-Control-Allow-Credentials": "true",
//       },
//     }).then((response) => {
//       console.log("response", response);
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       document.body.appendChild(link);
//       link.click();
//     });
//   };
  const fetchData = async () => {
    if (searchText) {
      const res = await axios.get(`${backendUrl}/filtered/:${searchText}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
      });
      setFolderStructure(res.data);
    } else {
      console.log("---->", backendUrl);
      const res = await axios.get(`${backendUrl}/all`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Credentials": "true",
          "Content-Type": "application/json",
        },
      });
      setFolderStructure(res.data);
    }
  };

  const fetchBackendURL = async () => {
    AWS.config.update({
      region: "us-east-2",
      credentials: {
        accessKeyId: "AKIASVBLMAYDLJFKDVSM",
        secretAccessKey: "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",
      },
    });
    const secretsManager = new AWS.SecretsManager();

    const data = await secretsManager
      .getSecretValue({
        SecretId: "/Backend/Url",
      })
      .promise();

    setBackendUrl(data.SecretString);
  };
  console.log("backendUrl", backendUrl);

  const transformFileData = (data) => {
    return Array.isArray(data)
      ? data.map((item) => {
          return {
            key: item.id,
            icon: <FileOutlined />,
            title: item.name,
            isLeaf: true,
            s3Url: item.s3_url,
          };
        })
      : [];
  };

  console.log("folderStructure", folderStructure);
  console.log("filePath", filePath);

  const onSelect = (selectedKeys, info) => {
    console.log("selected", selectedKeys);
    console.log("info", info);
    const selectedKey = selectedKeys[0];

    info.node.s3Url && setFilePath(info.selectedNodes[0].s3Url);
    if (
      typeof selectedKey === "string" &&
      selectedKey.includes("-add-folder")
    ) {
      // Extract the parent folder id from the key
      const parentId = Number(selectedKey.split("-")[0]);

      setParentFolderId(parentId);
      setIsModalVisible("folder");
    }
    if (typeof selectedKey === "string" && selectedKey.includes("-add-file")) {
      // Extract the parent folder id from the key
      const parentId = Number(selectedKey.split("-")[0]);

      setParentFolderId(parentId);
      setIsModalVisible("file");
    }
  };

  const clearCreateData = () => {
    setParentFolderId(null);
    setIsModalVisible(undefined);
    fetchData();
  };

  const transformToTreeData = (data) =>
    Array.isArray(data)
      ? data.map((item) => {
          return {
            key: item.id,
            icon: <FolderOpenOutlined />,
            title: item.name,
            children: [
              ...transformToTreeData(item.children || []),
              ...transformFileData(item.documents || []),
              {
                key: `${item.id}-add-file`,
                icon: <FileOutlined />,
                title: "Add Document",
                isLeaf: true,
              },
              {
                key: `${item.id}-add-folder`,
                icon: <FolderOpenOutlined />,
                title: "Add Folder",
                isLeaf: true,
              },
            ],
          };
        })
      : [];

  console.log("transformToTreeData", transformToTreeData(folderStructure));

  return (
    <Layout style={{ height: "100%", display: "flex" }}>
      <Sider width={300} style={{ background: "#fff" }}>
        <Space
          direction="vertical"
          size={"large"}
          style={{ width: "100%", marginTop: "25px" }}
        >
          <Search
            placeholder="input search text"
            enterButton="Search"
            size="small"
            onSearch={(value) => setSearchText(value)}
          />
          <Tree
            showIcon
            showLine
            treeData={transformToTreeData(folderStructure)}
            onSelect={onSelect}
          />
        </Space>
      </Sider>
      <Divider type="vertical" style={{ height: "100%" }} />
      <Content style={{ padding: "0 24px", minHeight: 280 }}>
        {filePath && <MyPdfViewer file={"./ABC.pdf"} />}
      </Content>
      {isModalVisible === "folder" && (
        <CreateFoldarModal
          handleCancel={clearCreateData}
          parentId={parentFolderId}
          backendUrl={backendUrl}
        />
      )}
      {isModalVisible === "file" && (
        <UplaodFileModal
          handleCancel={clearCreateData}
          parentId={parentFolderId}
          backendUrl={backendUrl}
        />
      )}
    </Layout>
  );
};

export default FolderStructure;
