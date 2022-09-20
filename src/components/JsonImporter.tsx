import { Inspector } from "react-inspector";
import { ErrorMessage } from "./ErrorMessage";
import { UploadButton } from "./UploadButton";
import { ImportedList } from "./ImportedList";
import { ProgressBar } from "./ProgressBar";
import * as C from "../styles/ContainerBox";

type JsonImporterProps = {
  title: string;
  object: {
    value: any;
    setValue: React.Dispatch<React.SetStateAction<any>>;
    check: string;
  };
  uploadEvent: () => void;
  progress: {
    current?: number;
    max?: number;
  };
  importedList?: {
    title: string;
    old: number;
    new: number;
  }[];
  warningList?: {
    title: string;
    id: number;
  }[];
};

export const JsonImporter = ({
  title,
  object,
  uploadEvent,
  progress,
  importedList,
  warningList,
}: JsonImporterProps) => {
  const importJson = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files && ev.target.files[0]) {
      const fileReader = new FileReader();
      fileReader.readAsText(ev.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        const parsedJson = JSON.parse(e.target?.result as string);
        if (object.check in parsedJson) {
          object.setValue(parsedJson);
        } else {
          object.setValue({ error: "arquivo inválido" });
        }
      };
    } else {
      object.setValue(undefined);
    }
  };

  return (
    <C.Container>
      <C.ContainerTitle>
        <span>{title}</span>
        <UploadButton
          active={object.value && !object.value.error}
          onClick={uploadEvent}
        />
      </C.ContainerTitle>
      <C.ContainerBody>
        <input type="file" onChange={(ev) => importJson(ev)} />
        {object.value && !object.value.error && (
          <Inspector table={false} data={object.value} />
        )}
        {object.value && object.value.error && (
          <ErrorMessage message="Arquivo Inválido" />
        )}
        <ProgressBar current={progress.current} max={progress.max} />
        {importedList && importedList?.length > 0 && (
          <ImportedList importedList={importedList} />
        )}
        {warningList && (
          <ul>
            {warningList?.map((item) => (
              <li key={item.id}>
                {item.title} - {item.id}
              </li>
            ))}
          </ul>
        )}
      </C.ContainerBody>
    </C.Container>
  );
};
