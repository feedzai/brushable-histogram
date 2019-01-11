import React from "react";
import { shallow } from "enzyme";
import Histogram from "./index";

/**
 * @author Victor Fernandes (victor.fernandes@feedzai.com)
 */

describe("index", () => {
    test("should render the histogram component", () => {
        expect(shallow(<Histogram />)).toMatchSnapshot();
    });
});
