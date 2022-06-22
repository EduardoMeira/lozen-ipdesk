import { FormEvent, useEffect, useState } from 'react'
import { useDomainContext } from '../context/DomainContext'
import { InfoTable } from '../components/InfoTable'
import { FormInput } from '../components/FormInputs/FormInput'
import { FormButton } from '../components/FormInputs/FormButton'
import { ApiAction, useApiContext } from '../context/ApiContext'
import { articlesApi } from '../api/articlesApi'
import { ArticleTS } from '../types/articleType'
import { randomGenerator } from '../helpers/randomGenerator'
import { FormSelect } from '../components/FormInputs/FormSelect'
import { sectionsApi } from '../api/sectionsApi'
import { RefreshButton } from '../components/RefreshButton'
import { TextAreaInput } from '../components/FormInputs/TextAreaInput'
import { getPermissionList } from '../helpers/filter'

export const ArticlePage = () => {
   const { state } = useDomainContext()
   const { state: apiState, dispatch: apiDispatch } = useApiContext()
   const [loading, setLoading] = useState(false)

   const [articleSectionInput, setArticleSectionInput] = useState('')
   const [articlePermissionInput, setArticlePermissionInput] = useState('')
   const [articleTitleInput, setArticleTitleInput] = useState('')
   const [articleDescInput, setArticleDescInput] = useState('')
   const [articleBodyInput, setArticleBodyInput] = useState('')

   useEffect(() => {
      if (apiState.articles) {
         startCheck()
      }
   }, [apiState.articles])

   const startCheck = async () => {
      if (apiState.articles?.articles) {
         getPermissionList(apiState.articles)
      }
      if (!apiState.sections) {
         apiDispatch({ type: ApiAction.setSections, payload: await sectionsApi.getSections(state) })
      }
   }

   const getArticles = async () => {
      setLoading(true)
      apiDispatch({ type: ApiAction.setArticles, payload: await articlesApi.getArticles(state) })
      setLoading(false)
   }

   const postArticle = async (ev: FormEvent<HTMLFormElement>) => {
      ev.preventDefault()

      setLoading(true)
      let newArticle: ArticleTS = {
         permission_group_id: parseInt(articlePermissionInput),
         user_segment_id: null,
         section_id: parseInt(articleSectionInput),
         title: articleTitleInput,
         description: articleDescInput,
         body: articleBodyInput
      }
      if (newArticle.title === '') {
         newArticle = randomGenerator.randomArticle(
            newArticle.section_id, newArticle.permission_group_id, newArticle.user_segment_id
         )
      }

      setArticleTitleInput('')
      setArticleDescInput('')
      setArticleBodyInput('')

      const createdArticle = await articlesApi.createArticle(state, newArticle)
      if (apiState.articles && createdArticle) {
         apiDispatch({
            type: ApiAction.setArticles, payload: {
               articles: [createdArticle.article, ...apiState.articles.articles],
               count: apiState.articles.count + 1
            }
         })
      }
      setLoading(false)
   }

   const deleteArticle = (id: number) => {
      articlesApi.deleteArticle(state, id)
      if (apiState.articles) {
         const newList = apiState.articles.articles.filter(item => item.id !== id)
         apiDispatch({
            type: ApiAction.setArticles, payload: {
               articles: newList,
               count: apiState.articles.count - 1
            }
         })
      }
   }

   return (
      <>
         <form className='my-24 rounded flex flex-col gap-4 justify-center items-center' onSubmit={(ev) => { postArticle(ev) }}>
            <h2 className='text-2xl mb-5 text-sky-800 font-semibold'>Criar Article</h2>
            <FormSelect onChange={setArticlePermissionInput} options={getPermissionList(apiState.articles)} />
            <FormSelect onChange={setArticleSectionInput} options={apiState.sections?.sections} />
            <FormInput placeholder='Nome (deixe vazio para gerar automaticamente)...' onChange={setArticleTitleInput} />
            <FormInput placeholder='Descrição...' onChange={setArticleDescInput} />
            <TextAreaInput placeholder='Corpo...' onChange={setArticleBodyInput} />
            <FormButton disable={loading} />
         </form>
         <br />
         {
            apiState.articles &&
            <InfoTable titles={['Identificação', 'Nome', 'Section']} deleteFunction={deleteArticle} infoList={{
               data: apiState.articles.articles, count: apiState.articles.count
            }} />
         }
         {
            !apiState.articles &&
            <RefreshButton loading={loading} onclick={getArticles} />
         }
      </>
   )
}