<script>
  import data from "./data.json";
  import Button from "@smui/button";
  import Radio from "@smui/radio";
  import FormField from "@smui/form-field";
  import IconButton from "@smui/icon-button";
  import List, { Item, Separator } from "@smui/list";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import Chip, { Text } from "@smui/chips";
  import Scroller from "@sveltejs/svelte-scroller";
  import dateFormat from "dateformat";
  import { onDestroy, onMount } from "svelte";
  let self = localStorage.getItem("user") || "";
  let selected = {};
  let comments = {};
  const getSelects = async () => {
    const date = dateFormat(new Date(), "yyyy-mm-dd");
    try {
      const r = await fetch(`/selected?date=${date}`);
      if (r.status === 200) {
        const j = await r.json();
        console.log(j);
        selected = {};
        j.map((d) => {
          selected[d.target] = d.user;
        });
      }
    } catch (e) {
      alert("无法连接数据库");
      console.log(e);
      clearInterval(interval);
    }
  };
  const getSelect = async (target) => {
    const date = dateFormat(new Date(), "yyyy-mm-dd");
    const r = await fetch(`/selected?date=${date}&target=${target}`);
    if (r.status === 200) {
      const j = await r.json();
      return j;
    }
  };
  const updateSelect = async (target, user) => {
    const existRecord = await getSelect(target);
    if (existRecord && existRecord.length !== 0) {
      const r = await fetch(`/selected/${existRecord[0].id}`, {
        method: "DELETE",
      });
      if (r.status === 200) {
        const j = await r.json();
        console.log(j);
      }
    } else {
      const date = dateFormat(new Date(), "yyyy-mm-dd");
      const r = await fetch(`/selected`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target,
          user,
          date,
        }),
      });
      if (r.status === 200) {
        const j = await r.json();
        console.log(j);
      }
    }
  };
  const handleSelect = async (id) => {
    if (self !== "") {
      await updateSelect(id, self);
    } else {
      alert("先选择你是谁");
    }
  };
  const getComment = async (target) => {
    const r = await fetch(`/comments?target=${target}`);
    if (r.status === 200) {
      const j = await r.json();
      return j;
    }
  };
  const getComments = async () => {
    try {
      const r = await fetch(`/comments`);
      if (r.status === 200) {
        const j = await r.json();
        console.log(j);
        comments = {};
        j.map((d) => {
          comments[d.target] = d.score;
        });
      }
    } catch (e) {
      console.log(e);
    }
  };
  const updateComment = async (target, score) => {
    const existRecord = await getComment(target);
    if (comments[target]) {
      score = comments[target] + score;
    } else {
      score = 0 + score;
    }
    if (existRecord.length != 0) {
      const r = await fetch(`/comments/${existRecord[0].id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target,
          score,
        }),
      });
      if (r.status === 200) {
        const j = await r.json();
        console.log(j);
      }
    } else {
      const r = await fetch(`/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target,
          score,
        }),
      });
      if (r.status === 200) {
        const j = await r.json();
        console.log(j);
      }
    }
  };
  let interval = null;
  onMount(async () => {
    interval = setInterval(async () => {
      await getSelects();
      await getComments();
    }, 1000);
  });
  onDestroy(async () => {
    clearInterval(interval);
  });
  let count;
  let index;
  let offset;
  let progress;
  let top = 0.1;
  let threshold = 0.5;
  let bottom = 0.9;
  let target = __myapp.env.TARGET;
</script>

<main>
  <Scroller
    {top}
    {threshold}
    {bottom}
    bind:count
    bind:index
    bind:offset
    bind:progress
  >
    <div slot="background">
      <div style="position: absolute;top: 0;left: 0;">
        汇总:
        <List class="demo-list">
          {#each Object.keys(selected) as k}
            <Item>
              <Text>
                {data.filter((i) => i.id == k)[0].name}-{data.filter(
                  (i) => i.id == k
                )[0].price}-{selected[k]}
              </Text>
            </Item>
            <Separator />
          {/each}
        </List>
      </div>
    </div>
    <div slot="foreground">
      <h1>中午点菜</h1>
      <div style="padding: 0">
        选择你是谁
        {#each target.split("") as u}
          <FormField>
            <Radio
              bind:group={self}
              value={u}
              on:change={() => localStorage.setItem("user", u)}
            />
            <span slot="label">{u}</span>
          </FormField>
        {/each}
      </div>
      <DataTable table$aria-label="People list">
        <Head>
          <Row>
            <Cell style="text-align: center;">菜名</Cell>
            <Cell style="text-align: center;">类别</Cell>
            <Cell style="text-align: center;">价格</Cell>
            <Cell style="text-align: center;">评分</Cell>
            <Cell style="text-align: center;">状态</Cell>
            <Cell style="text-align: center;">操作</Cell>
            <Cell style="text-align: center;">评价</Cell>
          </Row>
        </Head>
        <Body>
          {#each data as item, index}
            <Row>
              <Cell>{item.name}</Cell>
              <Cell>{item.type}</Cell>
              <Cell>{item.price}</Cell>
              <Cell numeric>
                {#if comments[index]}{comments[index]}{:else}0{/if}
              </Cell>
              <Cell>
                {#if selected[item.id]}
                  <Chip>
                    <Text>{selected[item.id]}</Text>
                  </Chip>
                {/if}
              </Cell>
              <Cell>
                <Button
                  variant="outlined"
                  color={selected[item.id] === undefined ? "" : "secondary"}
                  on:click={() => handleSelect(item.id)}
                >
                  {#if selected[item.id]}取消{:else}点菜{/if}
                </Button>
              </Cell>
              <Cell>
                <IconButton
                  class="material-icons"
                  on:click={() => updateComment(index, 1)}
                >
                  thumb_up
                </IconButton>
                <IconButton
                  class="material-icons"
                  on:click={() => updateComment(index, -1)}
                >
                  thumb_down
                </IconButton>
              </Cell>
            </Row>
          {/each}
        </Body>
      </DataTable>
    </div>
  </Scroller>
</main>

<style>
  main {
    text-align: center;
    /* padding: 1em;
		margin: 0 auto; */
    /* max-width: 240px; */
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }
</style>
