import { schema } from 'nexus'
import { core } from 'nexus/components/schema'

schema.objectType({
  name: 'Post',
  definition(t) {
    t.int('id')
    t.string('title')
    t.string('body')
    t.boolean('published')
  },
})

/**
 * If you want to type your resolvers in an external file
 */
const draftsResolver: core.FieldResolver<'Query', 'drafts'> = (
  root,
  args,
  ctx,
) => {
  return ctx.db.post.findMany({ where: { published: false } })
}

schema.extendType({
  type: 'Query',
  definition(t) {
    t.field('posts', {
      type: 'Post',
      list: true,
      nullable: false,
      resolve(root, args, ctx) {
        return ctx.db.post.findMany({ where: { published: true } })
        // below was the call to the in memory DB
        // return ctx.db.posts.filter((p) => p.published === true)
      },
    })
    t.field('drafts', {
      type: 'Post',
      list: true, // <-- this could also be t.list.field but not both
      nullable: false,
      // resolve : draftsResolver, // <--- if you need to have your resolvers external
      resolve(root, args, ctx) {
        return ctx.db.post.findMany({ where: { published: false } })
        // below was the call to the in memory DB
        // return ctx.db.posts.filter((p) => p.published === false)
      },
    })
  },
})

schema.extendType({
  type: 'Mutation',
  definition(t) {
    t.field('publish', {
      type: 'Post',
      args: {
        draftId: schema.intArg({ required: true }),
      },
      resolve(_root, args, ctx) {
        return ctx.db.post.update({
          where: { id: args.draftId },
          data: { published: true },
        })
        // below was the call to the in memory DB
        // let draftToPublish = ctx.db.posts.find((p) => p.id === args.draftId)

        // if (!draftToPublish) {
        //   throw new Error('Could not find draft with id ' + args.draftId)
        // }

        // draftToPublish.published = true

        // return draftToPublish
      },
    })
    t.field('createDraft', {
      type: 'Post',
      nullable: false,
      args: {
        title: schema.stringArg({ required: true }),
        body: schema.stringArg({ required: true }),
      },
      resolve(_root, args, ctx) {
        return ctx.db.post.create({
          data: {
            title: args.title,
            body: args.body,
            published: false,
          },
        })
        // below was the call to the in memory DB
        // ctx.db.posts.push(draft)
      },
    })
  },
})
