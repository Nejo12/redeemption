import { render, screen } from "@testing-library/react";

describe("web test smoke", () => {
  it("renders a basic node", () => {
    render(<div>Hello Moments-to-Mail</div>);
    expect(screen.getByText("Hello Moments-to-Mail")).toBeTruthy();
  });
});

