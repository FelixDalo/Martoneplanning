import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        services: resolve(__dirname, "services.html"),
        projects: resolve(__dirname, "projects.html"),
        projectDetail: resolve(__dirname, "project-detail.html"),
        projectDetailDevelopmentManager: resolve(__dirname, "project-detail-development-manager.html"),
        projectDetailChobeBrigade: resolve(__dirname, "project-detail-chobe-brigade.html"),
        projectDetailKasaneHospitalHousing: resolve(__dirname, "project-detail-kasane-hospital-housing.html"),
        projectDetailMaunNewMall: resolve(__dirname, "project-detail-maun-new-mall.html"),
        projectDetailPalapyeFillingStation: resolve(__dirname, "project-detail-palapye-filling-station.html"),
        projectDetailMoraleFarm: resolve(__dirname, "project-detail-morale-farm.html"),
        projectDetailFeasibilityStudies: resolve(__dirname, "project-detail-feasibility-studies.html"),
        programmes: resolve(__dirname, "programmes.html"),
        contact: resolve(__dirname, "contact.html"),
      },
    },
  },
});
