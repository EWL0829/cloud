import React, { useState } from 'react';
import { faFileImport, faPlus } from '@fortawesome/free-solid-svg-icons';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { v4 as uuidv4 } from 'uuid';
import FileSearch from "./components/FileSearch";
import FileList from "./components/FileList";
import defaultFiles from "./utils/defaultFiles";
import BottomBtn from "./components/BottomBtn";
import TabList from "./components/TabList";
import { flattenArr, objToArr } from './utils/helper';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    const [files, setFiles] = useState(flattenArr(defaultFiles)); // 传递到列表中的fileList
    const [activeFileId, setActiveFileId] = useState(-1); // 当前处于编辑面板激活的文件，只有一个
    const [openedFileIDs, setOpenedFileIDs] = useState([]); // // 当前打开的文件，可能有多个，所以是数组
    const [unsavedFileIDs, setUnsavedFileIDs] = useState([]); // 未被保存的文件
    const [searchedFiles, setSearchedFiles] = useState([]); // 被搜索的数组，files数组被很多场景依赖，这里需要翻出抽取出来进行展示或者过滤
    const filesArray = objToArr(files);

    const updateFileContent = (id, updateProps) => {
        const newFile = { ...files[id], ...updateProps };

        setFiles({ ...files, [id]: newFile });
    };
    const fileClick = (id) => {
        // 1. 将激活的id设置为当前的id
        // 2. 将editor打开，展示当前激活id的内容
        // 3. 给openedFilesIDs里面push一条记录进去，记得查重 setActiveFileId(id);
        if (!openedFileIDs.includes(id)) {
            setOpenedFileIDs([...openedFileIDs, id]);
            setActiveFileId(id);
        }
    };
    const tabClick = (id) => {
        if (id !== activeFileId) {
            setActiveFileId(id);
        }
    };
    const tabClose = (id) => {
        const filteredTabList = openedFileIDs.filter(fileId => fileId !== id);
        setOpenedFileIDs(filteredTabList);
        if (filteredTabList.length > 0) {
            setActiveFileId(filteredTabList[0]);
        } else {
            setActiveFileId(-1);
        }
    };
    const fileChange = (id, value) => { // 1. update the active file body // 2. update the unsavedFiles
        updateFileContent(id, {
            body: value
        });

        if (!unsavedFileIDs.includes(id)) {
            setUnsavedFileIDs([...unsavedFileIDs, id]);
        }
    };
    const activeFile = files[activeFileId];

    const deleteFile = (id) => {
        const newFiles = files.filter(file => file.id !== id);
        setFiles(newFiles);
        // close tab if open
        tabClose(id);
    };

    const updateFileName = (id, title) => {
        updateFileContent(id, {
            title,
            isNew: false
        });
    };

    const fileSearch = (keyword) => {
        // filter out the new files based on the keyword
        // 如果这里的keyword输入为空，那么includes判断会判断files中每一个都含有空字符串，自然就会展示全量列表了
        const newFiles = filesArray.filter(file => file.title.includes(keyword));
        console.log('newFiles', newFiles); // eslint-disable-line
        setSearchedFiles(newFiles);
    };
    // 当搜索的内容不为空的时候，就显示搜索列表否则显示默认的文件列表
    // todo 体验优化的话最好在搜不到的时候添加一个toast提示，提醒用户没有对应的搜索结果
    const fileListArr = searchedFiles.length > 0 ? searchedFiles : filesArray;
    const openedFiles = openedFileIDs.map(openedId => {
        return files[openedId];
    });

    const createNewFile = () => {
        const newId = uuidv4();
        const newFile = {
            title: '新建文件',
            id: newId,
            body: '## 文件还是空的哦',
            createAt: Date.now(),
            isNew: true,
        }
        console.log({newFiles}); // eslint-disable-line
        setFiles({ ...files, [newId]: newFile });
    };
    return (
        <div className="App container-fluid px-0">
            <div className="row no-gutters">
                <div className="col-4 bg-light left-panel">
                    <FileSearch
                        title="我的文档"
                        onFileSearch={(value) => {
                            console.log('file', value);
                            fileSearch(value);
                        }}
                    />
                    <FileList
                        files={fileListArr}
                        onFileClick={(id) => {
                            fileClick(id);
                        }}
                        onSaveEdit={(id, newValue) => {
                            // id 与 title
                            updateFileName(id, newValue);
                        }}
                        onFileDelete={(id) => {
                            deleteFile(id);
                        }}
                    />
                    <div className="row no-gutters button-group">
                        <div className="col">
                            <BottomBtn
                                text="新建"
                                icon={faPlus}
                                colorClass="btn-primary"
                                onBtnClick={() => {
                                    createNewFile();
                                }}
                            />
                        </div>
                        <div className="col">
                            <BottomBtn
                                text="导入"
                                icon={faFileImport}
                                colorClass="btn-success"
                            />
                        </div>
                    </div>
                </div>
                <div className="col-8 right-panel">
                    {
                        !activeFile ?
                            <div className="start-page">选择或者创建新的Markdown文件</div> :
                            <>
                                <TabList
                                    files={openedFiles} activeId={activeFileId} unsavedIds={unsavedFileIDs}
                                    onTabClick={tabClick} onCloseTab={tabClose}
                                /> <SimpleMDE
                                key={activeFile && activeFile.id}
                                value={activeFile && activeFile.body}
                                onChange={(value) => {
                                    fileChange(activeFile.id, value);
                                }} options={{
                                minHeight: '515px',
                            }}
                            /> </>
                    } </div>
            </div>
        </div>
    );
}

export default App;
