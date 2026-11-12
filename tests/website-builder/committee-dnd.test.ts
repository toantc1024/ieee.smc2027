import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CommitteesSection } from "../../src/components/sections/CommitteesSection";
import { getBlockDefinition } from "../../src/modules/website-builder/registry";
import { InspectorField } from "../../src/modules/website-builder/components/studio/inspector-fields";
import { setFieldValue } from "../../src/modules/website-builder/utils/field-values";

test("CommitteesSection renders default conference committees without errors", () => {
  const markup = renderToStaticMarkup(React.createElement(CommitteesSection, {}));
  assert.match(markup, /Organizing Committee/);
  assert.match(markup, /Steering Committee/);
});

test("CommitteesSection handles empty groups without crashing", () => {
  const markup = renderToStaticMarkup(React.createElement(CommitteesSection, { groups: [] }));
  assert.ok(markup.length > 0);
  assert.match(markup, /Organizing Committee/);
});

test("CommitteesSection handles groups with 0 members without RangeError or division by zero", () => {
  const customGroups = [
    {
      groupName: "Empty Test Committee",
      members: [],
    },
  ];
  assert.doesNotThrow(() => {
    const markup = renderToStaticMarkup(React.createElement(CommitteesSection, { groups: customGroups }));
    assert.match(markup, /Empty Test Committee/);
    assert.match(markup, /No committee members in/);
  });
});

test("CommitteesSection handles members with missing or undefined fields safely", () => {
  const customGroups = [
    {
      groupName: "Incomplete Member Group",
      members: [
        {
          name: "",
          role: "",
          affiliation: "",
          country: "",
        },
        {
          name: "Dr. Alice Example",
          role: "Co-Chair",
          affiliation: "HCMUTE",
          country: "Vietnam",
        },
      ],
    },
  ];

  assert.doesNotThrow(() => {
    const markup = renderToStaticMarkup(React.createElement(CommitteesSection, { groups: customGroups }));
    assert.match(markup, /Incomplete Member Group/);
    assert.match(markup, /Dr\. Alice Example/);
    assert.match(markup, /Co-Chair/);
  });
});

test("Committee block definition contains groups and members with complete defaultItem", () => {
  const def = getBlockDefinition("CommitteesSection");
  assert.ok(def);
  const groupsField = def.fields.groups;
  assert.equal(groupsField.type, "array");
  assert.ok(groupsField.defaultItem);
  assert.equal(groupsField.defaultItem.groupName, "New Committee Group");
  assert.ok(Array.isArray(groupsField.defaultItem.members));
  assert.ok(groupsField.defaultItem.members.length > 0);

  const membersField = groupsField.itemFields?.members;
  assert.ok(membersField);
  assert.equal(membersField.type, "array");
  assert.ok(membersField.defaultItem);
  assert.equal(membersField.defaultItem.role, "Committee Member");
});

test("ArrayField in inspector renders GripVertical drag handles with accessibility labels", () => {
  const def = getBlockDefinition("CommitteesSection")!;
  const markup = renderToStaticMarkup(React.createElement(InspectorField, {
    field: def.fields.groups,
    value: [
      {
        groupName: "Group A",
        members: [{ name: "Alice", role: "Chair", affiliation: "HCM-UTE", country: "Vietnam" }],
      },
      {
        groupName: "Group B",
        members: [{ name: "Bob", role: "Secretary", affiliation: "HCM-UTE", country: "Vietnam" }],
      },
    ],
    path: ["groups"],
    onChange() {},
    onBusyChange() {},
  }));

  assert.match(markup, /Group A/);
  assert.match(markup, /Group B/);
  assert.match(markup, /aria-label="Drag to reorder Group A"/);
  assert.match(markup, /aria-label="Drag to reorder Group B"/);
  assert.match(markup, /title="Drag to reorder position"/);
  assert.match(markup, /draggable="true"/);
});

test("Reordering array items preserves nested data integrity", () => {
  const groups = [
    {
      groupName: "Group 1",
      members: [
        { name: "Member 1A" },
        { name: "Member 1B" },
      ],
    },
    {
      groupName: "Group 2",
      members: [
        { name: "Member 2A" },
      ],
    },
  ];

  // Reorder members inside Group 1
  const reorderedMembers = [groups[0].members[1], groups[0].members[0]];
  const afterMemberReorder = setFieldValue(groups, [0, "members"], reorderedMembers) as typeof groups;
  assert.equal(afterMemberReorder[0].members[0].name, "Member 1B");
  assert.equal(afterMemberReorder[0].members[1].name, "Member 1A");
  assert.equal(afterMemberReorder[1].members[0].name, "Member 2A");

  // Reorder outer groups
  const reorderedGroups = [afterMemberReorder[1], afterMemberReorder[0]];
  assert.equal(reorderedGroups[0].groupName, "Group 2");
  assert.equal(reorderedGroups[1].groupName, "Group 1");
  assert.equal(reorderedGroups[1].members[0].name, "Member 1B");
});
