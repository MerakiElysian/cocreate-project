import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  collaborators: string[];
}

interface ProjectState {
  items: Project[];
  loading: boolean;
}

const initialState: ProjectState = {
  items: [],
  loading: false,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.items = action.payload;
    },
    addProject(state, action: PayloadAction<Project>) {
      state.items.unshift(action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setProjects, addProject, setLoading } = projectSlice.actions;
export default projectSlice.reducer;
