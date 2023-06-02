import agent from '../agent';
import { countViewChange, redirectToHome } from './common';
import { update, initialStates } from '../store';

export const articlePageUnloaded = () => {
  update({ $set: { article: initialStates.article } });
  countViewChange();
};

export const createArticle = (article) => {
  onInit();
  agent.Articles.create(article).then(onUpdateSuccess).catch(onUpdateError);
};

export const updateArticle = (article) => {
  onInit();
  agent.Articles.update(article).then(onUpdateSuccess).catch(onUpdateError);
};

export const getArticle = (slug) => {
  onInit();
  return agent.cancellable(
    () => agent.Articles.get(slug),
    (payload) => {
      update({
        $set: {
          'article.article': payload.article,
          'article.inProgress': false,
        },
      });
    },
    null,
    onComplete
  );
};

export const deleteArticle = (slug) => {
  onInit();
  agent.Articles.del(slug).then(redirectToHome).finally(onComplete);
};

function onInit() {
  update({ $set: { 'article.inProgress': true } });
}
function onUpdateSuccess(payload) {
  update({
    $set: {
      'article.inProgress': false,
      redirectTo: `/article/${payload.article.slug}`,
    },
  });
}
function onUpdateError(error) {
  update({
    $set: {
      'article.inProgress': false,
      'article.errors': error,
    },
  });
}
function onComplete() {
  update({ $set: { 'article.inProgress': false } });
}
// export const getArticle = createAsyncThunk(
//   'article/getArticle',
//   agent.Articles.get
// );

// export const createArticle = createAsyncThunk(
//   'article/createArticle',
//   agent.Articles.create,
//   { serializeError }
// );

// export const updateArticle = createAsyncThunk(
//   'article/updateArticle',
//   agent.Articles.update,
//   { serializeError }
// );

// const initialState = {
//   article: undefined,
//   inProgress: false,
//   errors: undefined,
// };

// const articleSlice = createSlice({
//   name: 'article',
//   initialState,
//   reducers: {
//     articlePageUnloaded: () => initialState,
//   },
//   extraReducers: (builder) => {
//     builder.addCase(getArticle.fulfilled, (state, action) => {
//       state.article = action.payload.article;
//       state.inProgress = false;
//     });

//     builder.addCase(createArticle.fulfilled, (state) => {
//       state.inProgress = false;
//     });

//     builder.addCase(createArticle.rejected, (state, action) => {
//       state.errors = action.error.errors;
//       state.inProgress = false;
//     });

//     builder.addCase(updateArticle.fulfilled, (state) => {
//       state.inProgress = false;
//     });

//     builder.addCase(updateArticle.rejected, (state, action) => {
//       state.errors = action.error.errors;
//       state.inProgress = false;
//     });

//     builder.addMatcher(
//       (action) => action.type.endsWith('/pending'),
//       (state) => {
//         state.inProgress = true;
//       }
//     );

//     builder.addDefaultCase((state) => {
//       state.inProgress = false;
//     });
//   },
// });

// export const { articlePageUnloaded } = articleSlice.actions;

// export default articleSlice.reducer;
