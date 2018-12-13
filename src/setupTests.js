import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

// This file is necessary to use enzyme in the unit tests

configure({ adapter: new Adapter() });

process.TZ = "UTC";
