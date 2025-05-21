import { FormControl, FormItem, FormMessage } from "@/components/ui/form";
import Image from "next/image";
import { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import Dropzone from "shadcn-dropzone";

interface DropzoneFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
}

const DropzoneField = <T extends FieldValues>({
  control,
  name,
  label,
}: DropzoneFieldProps<T>) => {
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Dropzone
              accept={{
                "application/pdf": [".pdf"],
                "application/msword": [".doc"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
              }}
              maxFiles={1}
              onDrop={(acceptedFiles: File[]) => {
                const file = acceptedFiles[0];
                field.onChange(file);
                setFileName(file?.name ?? null);
              }}
            >
              {({ isDragAccept }) => (
                <div className="w-full h-[300px] flex justify-center items-center flex-col border border-dashed rounded-md border-4">
                  <Image
                    src="/upload.png"
                    alt="ai interviewer logo"
                    width={38}
                    height={32}
                  />
                  {isDragAccept ? (
                    <div className="text-sm font-medium mt-2">
                      Drop your resume here!
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium mt-2">
                        Drag and drop or click to upload a resume
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {fileName || "No file uploaded yet"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Accepted formats: .pdf, .doc, .docx
                      </div>
                    </>
                  )}
                </div>
              )}
            </Dropzone>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DropzoneField;
