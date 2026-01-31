'use client';

import {
	faAddressCard,
	faSearch,
	faSpinner,
  faUserCheck,
  faUserClock,
  faUserFriends,
  faUserMinus,
  faUserPlus} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import { acceptFriend, addFriend, declineFriend, removeFriend } from '@/app/lib/actions';
import { FriendsData, Friendship } from '@/app/lib/definitions';
import fetcher from '@/app/lib/fetcher';
import { playerSpriteImageLoader } from '@/app/lib/image-loader';
import PlayerSprite from '@/app/ui/player-sprite';

const categories = {
	friends: {
		name: 'Arkadaşlar',
		module: FriendsModule
	},
	invites: {
		name: 'Davetler',
		module: InvitesModule
	},
	findfriend: {
		name: 'Arkadaşlarını Bul',
		module: FindFriendModule
	}
};

type Category = keyof typeof categories;

export default function Friends({ckey}: {ckey: string}) {
  const [activeTab, setActiveTab] = useState<Category>('friends');
	const { data, error, isLoading, mutate } = useSWR<FriendsData>('/api/player/friends', fetcher, {revalidateOnFocus: false});
	const CurrentPage = categories[activeTab].module;

  return (
		<div className="w-full flex-1 flex flex-col items-center gap-5 px-2 pt-8 sm:px-14 lg:px-[13.5rem]">
			<div className="w-full flex flex-col items-center gap-5">
				<span className="text-center text-3xl font-bold mb-4">Arkadaşlar</span>
				<div className="w-full flex flex-col md:flex-row md:space-x-4">
					<div className="md:max-w-full h-min p-4 mb-4 bg-gray-700 bg-opacity-10 rounded-[.25rem]">
						<h2 className="mb-4 text-white text-lg font-bold text-center md:text-base">Kategoriler</h2>
						<ul className="space-y-2 [&>li]:px-4 [&>li]:py-2">
							{Object.entries(categories).map(([category, item]) => (
								<li key={category} className={`${activeTab === category && 'bg-gray-500'} text-center cursor-pointer rounded-lg text-white hover:bg-gray-500 transition-colors text-nowrap`} onClick={() => setActiveTab(category as Category)}>{item.name}</li>
							))}
						</ul>
					</div>
					<div className="md:max-w-full md:flex-1 bg-gray px-4 rounded-xl">
						{isLoading && !data && !error && (
							<div className="w-full flex items-center justify-center">
								<div className="w-12 h-12 flex items-center justify-center opacity-50">
									<Icon icon={faSpinner} size="3x" spin/>
								</div>
							</div>
						)}
						{data && (
							<div className="md:max-w-full min-h-full p-4 mb-4 bg-opacity-10 rounded-[.25rem] bg-gray-800/10"><CurrentPage friends={data.friends} received={data.received} sent={data.sent} ckey={ckey} mutate={mutate} /></div>
						)}
						{error && (
							<div className="w-full flex items-center justify-center">
								<span className="text-red-500">An error has occurred: {error.message}</span>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
  );
}

function FriendsModule({friends, ckey, mutate}: {friends: Friendship[], ckey:string, mutate: () => void}) {
	const onMutate = () => {
		mutate();
  };

	return (
		<div>
			<h2 className="m-2 mb-4 text-white text-lg font-bold text-center md:text-base">Arkadaşlarım</h2>
			{friends.length ? (
				<div className='grid wide:grid-cols-2 ultrawide:grid-cols-3 huge:grid-cols-4 gap-2'>
					{friends.map((item, index) => <FriendCard key={index} friend={item} ckey={ckey} mutate={onMutate} />)}
				</div>
			) : (
				<span className='w-full flex items-center justify-center'>Ne yazıkki hiçbir arkadaşın yok :(</span>
			)}
		</div>
	);
}

function InvitesModule({received, sent, ckey, mutate}: {received: Friendship[], sent: Friendship[], ckey:string, mutate: () => void}) {
	const onMutate = () => {
		mutate();
  };

	return (
		<div>
			<h2 className="m-2 mb-4 text-white text-lg font-bold text-center md:text-base">Gelen Davetler</h2>
			{received.length > 0 ? (
				<div className='grid wide:grid-cols-2 ultrawide:grid-cols-3 huge:grid-cols-4 gap-2'>
					{received.map((item, index) => <FriendCard key={index} friend={item} ckey={ckey} mutate={onMutate} />)}
				</div>
			) : (
				<span className='w-full flex items-center justify-center'>Gelen aktif bir arkadaşlık isteği bulunmuyor..!</span>
			)}
			<br />
			<h2 className="m-2 mb-4 text-white text-lg font-bold text-center md:text-base">Giden Davetler</h2>
			{sent.length > 0 ? (
				<div className='grid wide:grid-cols-2 ultrawide:grid-cols-3 huge:grid-cols-4 gap-2'>
					{sent.map((item, index) => <FriendCard key={index} friend={item} ckey={ckey} mutate={onMutate} />)}
				</div>
			) : (
				<span className='w-full flex items-center justify-center'>Gönderdiğin aktif bir arkadaşlık isteği bulunmuyor..!</span>
			)}
		</div>
	);
}

function FindFriendModule({ckey, mutate}: {ckey:string, mutate: () => void}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const timeoutRef = useRef(0);

	const [input, setInput] = useState('');
	const [autocomplete, setAutocomplete] = useState<string[]>([]);

	const { data, isLoading } = useSWRImmutable<string[]>('/api/autocomplete/ckey?ckey=' + input, fetcher, {
		isPaused: () => inputRef.current ? inputRef.current.value.length === 0 : true,
	});

	const onInput = useCallback(() => {
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			setInput(inputRef.current?.value ?? '');
		}, 500) as any as number;
	}, []);

	useEffect(() => {
		if (input.length === 0) {
			setAutocomplete([]);
		} else if (data) {
			setAutocomplete(data.filter(item => item !== ckey));
		}
	}, [input, data, ckey]);

	useEffect(() => {
		setTimeout(() => {
			inputRef.current?.focus();
		}, 1);
	}, []);

	const onMutate = () => {
		mutate();
  };

	return (
		<div>
			<div className="flex items-center justify-between w-full relative">
				<div className="flex-1"></div>
				<div className="flex-1 text-center">
					<h2 className="m-2 mb-4 text-white text-lg font-bold text-center md:text-base">Arkadaş Bul</h2>
				</div>
				<div className="flex-1 flex justify-end">
					<div className="flex items-center px-3 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-[.25rem] w-64 focus-within:border-opacity-30 transition-all">
						<input
							className="h-full flex-1 bg-transparent outline-none text-sm text-white"
							ref={inputRef}
							onInput={onInput}
							placeholder="Oyuncu ara"
						/>
						<div className="w-5 flex justify-center"><Icon icon={isLoading ? faSpinner : faSearch} spin={isLoading} className={`${isLoading && 'opacity-50'} text-white align-middle`} /></div>
					</div>
				</div>
			</div>
			{autocomplete.length > 0 && (
				<div className='grid wide:grid-cols-2 ultrawide:grid-cols-3 huge:grid-cols-4 gap-2'>
					{autocomplete.map((item) => <FriendCard key={item} friendCkey={item} ckey={ckey} mutate={onMutate} />)}
				</div>
			)}
		</div>
	);
}

function FriendCard({ friend, ckey, friendCkey, mutate }: { friend?: Friendship, ckey: string, friendCkey?: string, mutate: () => void }) {
  const [friendship, setFriendship] = useState<Friendship | null | undefined>(friend);
  const [friend_ckey, setFriendCkey] = useState<string | undefined>(friendCkey);

  const { data: favorite_character } = useSWRImmutable(friend_ckey ? `/api/player/favorite-character?ckey=${friend_ckey}` : null, fetcher);
  const { data: checked_friendship } = useSWRImmutable<Friendship>(friend_ckey ? `/api/player/friends/check-friendship?friend_ckey=${friend_ckey}` : null, fetcher);

  useEffect(() => {
    if (checked_friendship) {
      setFriendship(checked_friendship);
    }
  }, [checked_friendship]);

  useEffect(() => {
    if (!friendCkey && friendship) {
      setFriendCkey(friendship.user_ckey === ckey ? friendship.friend_ckey : friendship.user_ckey);
    }
  }, [friendship, friendCkey, ckey]);

  const onButtonClick = (friendship: Friendship | null | undefined) => {
    setFriendship(friendship);
    mutate();
  };

  return (
    <div className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-800/40 rounded-lg border border-white/5 hover:border-indigo-500/20 transition-all duration-300 group shadow-sm gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-md bg-gray-950/80 border border-white/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <PlayerSprite
            imageSrc={`${ckey.toLowerCase()}/${favorite_character?.[0]?.replace(/[\\\n\t/?%*:|<>]|\.\./g, '').replaceAll(' ', '%20').toLowerCase()}.png`}
            direction={0}
            scale={1.4}
            targetArea={1}
            loader={playerSpriteImageLoader}
            job={favorite_character?.[1]}
          />
        </div>

        <div className="flex flex-col min-w-0">
          <Link
            href={`/players/${friend_ckey}`}
            className="text-gray-100 font-semibold text-sm sm:text-base tracking-wide truncate hover:text-indigo-400 transition-colors"
          >
            {friend_ckey}
          </Link>
          <span className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-tighter truncate">
            {friendship?.status === 'accepted' ? 'Arkadaş' : friendship?.status === 'pending' ? 'Bekliyor' : 'Oyuncu'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <FriendButton friendship={friendship} onButtonClick={onButtonClick} ckey={ckey} friendCkey={friend_ckey} />
        <Link
          href={`/players/${friend_ckey}`}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90 bg-gray-500/10 text-gray-500 hover:text-white"
        >
          <Icon icon={faAddressCard} className="text-sm sm:text-base" />
        </Link>
      </div>
    </div>
  );
}

function FriendButton({ friendship, onButtonClick, ckey, friendCkey }: { friendship: Friendship | null | undefined, onButtonClick: (friendship: Friendship | null | undefined) => void, ckey: string, friendCkey?: string }) {
  if (!ckey || !friendCkey) return <div className="w-8 sm:w-10"></div>;
  if (friendship === undefined) return <div className="w-8 sm:w-10 flex justify-center"><Icon icon={faSpinner} size="3x" spin/></div>;

  const btnBase = 'w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-all duration-100 active:scale-90 flex-shrink-0';

  if (friendship?.status === 'pending') {
    if (friendship.user_ckey === ckey) {
      return (
        <button
          className={`${btnBase} bg-amber-500/10 text-amber-500 hover:bg-red-500 hover:text-white group/btn`}
          onClick={async () => { declineFriend(ckey, friendship.id).then(res => onButtonClick(res)); }}
          title="İsteği İptal Et"
        >
          <Icon icon={faUserClock} className="block group-hover/btn:hidden text-sm sm:text-base" />
          <Icon icon={faUserMinus} className="hidden group-hover/btn:block text-sm sm:text-base" />
        </button>
      );
    } else if (friendship.friend_ckey === ckey) {
      return (
        <Fragment>
          <button
            className={`${btnBase} bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white`}
            onClick={async () => { acceptFriend(ckey, friendship.id).then(res => onButtonClick(res)); }}
            title="Kabul Et"
          >
            <Icon icon={faUserCheck} className="text-sm sm:text-base" />
          </button>
          <button
            className={`${btnBase} bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white`}
            onClick={async () => { declineFriend(ckey, friendship.id).then(res => onButtonClick(res)); }}
            title="Reddet"
          >
            <Icon icon={faUserMinus} className="text-sm sm:text-base" />
          </button>
        </Fragment>
      );
    }
  } else if (friendship?.status === 'accepted') {
    return (
      <button
        className={`${btnBase} bg-indigo-500/10 text-indigo-400 hover:bg-red-500 hover:text-white group/btn`}
        onClick={async () => { removeFriend(ckey, friendship.id).then(res => onButtonClick(res)); }}
        title="Arkadaşlıktan Çıkar"
      >
        <Icon icon={faUserFriends} className="block group-hover/btn:hidden text-sm sm:text-base" />
        <Icon icon={faUserMinus} className="hidden group-hover/btn:block text-sm sm:text-base" />
      </button>
    );
  }

  return (
    <button
      className={`${btnBase} bg-white/5 text-gray-400 hover:bg-indigo-600 hover:text-white`}
      onClick={async () => { addFriend(ckey, friendCkey).then(res => onButtonClick(res)); }}
      title="Arkadaş Ekle"
    >
      <Icon icon={faUserPlus} className="text-sm sm:text-base" />
    </button>
  );
}
