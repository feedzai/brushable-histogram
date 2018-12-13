import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

// This file is necessary to use enzyme in the unit tests

configure({ adapter: new Adapter() });

// Set the timezone so that the expected output of time related tests is the same
process.TZ = "UTC";
