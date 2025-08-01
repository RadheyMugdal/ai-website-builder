import { ProjectData } from "@/modules/project/schema"
import JSZip from "jszip"
import { saveAs } from 'file-saver'

export async function exportCode(projectData: Array<{
    path: string;
    content?: string;
}>) {
    var zip = new JSZip()

    projectData.forEach(file => {
        zip.file(file.path, file.content!)
    })

    zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "project.zip")
    })

}