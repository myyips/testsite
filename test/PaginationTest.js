import test from "ava";
import Template from "../src/Template";
import TemplateData from "../src/TemplateData";
import Pagination from "../src/Plugins/Pagination";

test("Pagination enabled in frontmatter", async t => {
  let tmpl = new Template(
    "./test/stubs/paged/pagedresolve.njk",
    "./test/stubs/",
    "./dist"
  );

  let data = await tmpl.getData();
  let paging = new Pagination(data);
  paging.setTemplate(tmpl);

  t.truthy(data.testdata);
  t.truthy(data.testdata.sub);

  t.truthy(data.pagination);
  t.is(data.pagination.data, "testdata.sub");
  t.is(data.pagination.size, 4);
});

test("Resolve paged data in frontmatter", async t => {
  let tmpl = new Template(
    "./test/stubs/paged/pagedresolve.njk",
    "./test/stubs/",
    "./dist"
  );

  let paging = new Pagination(await tmpl.getData());
  paging.setTemplate(tmpl);
  t.is(paging._resolveItems().length, 8);
  t.is(paging._getItems().length, 2);
});

test("Paginate data in frontmatter", async t => {
  let tmpl = new Template(
    "./test/stubs/paged/pagedinlinedata.njk",
    "./test/stubs/",
    "./dist"
  );

  let data = await tmpl.getData();
  let paging = new Pagination(data);
  paging.setTemplate(tmpl);
  let pages = await paging.getPageTemplates();
  t.is(pages.length, 2);

  t.is(pages[0].getOutputPath(), "./dist/paged/pagedinlinedata/index.html");
  t.is(
    (await pages[0].render()).trim(),
    "<ol><li>item1</li><li>item2</li><li>item3</li><li>item4</li></ol>"
  );

  t.is(pages[1].getOutputPath(), "./dist/paged/pagedinlinedata/1/index.html");
  t.is(
    (await pages[1].render()).trim(),
    "<ol><li>item5</li><li>item6</li><li>item7</li><li>item8</li></ol>"
  );
});

test("Paginate external data file", async t => {
  let dataObj = new TemplateData();
  await dataObj.cacheData();

  let tmpl = new Template(
    "./test/stubs/paged/paged.njk",
    "./test/stubs/",
    "./dist",
    dataObj
  );

  let data = await tmpl.getData();

  // local data
  t.truthy(data.items.sub.length);

  let paging = new Pagination(data);
  paging.setTemplate(tmpl);
  let pages = await paging.getPageTemplates();
  t.is(pages.length, 2);

  t.is(pages[0].getOutputPath(), "./dist/paged/paged/index.html");
  t.is(
    (await pages[0].render()).trim(),
    "<ol><li>item1</li><li>item2</li><li>item3</li><li>item4</li><li>item5</li></ol>"
  );

  t.is(pages[1].getOutputPath(), "./dist/paged/paged/1/index.html");
  t.is(
    (await pages[1].render()).trim(),
    "<ol><li>item6</li><li>item7</li><li>item8</li></ol>"
  );
});
