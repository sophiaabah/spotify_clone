import {
  Box,
  Flex,
  Image,
  Center,
  Spacer,
  Link,
  List,
  ListItem,
  ListIcon,
  Input,
  HStack,
  Button,
  Text,
  Stack,
  Heading,
  VStack,
  Grid,
  GridItem,
  Checkbox,
  ButtonGroup,
  FormLabel,
  IconButton,
  Container,
  Wrap,
  WrapItem,
  chakra,
  FormControl,
  Divider,
  Icon,
  Progress,
} from "@chakra-ui/react";
import { FiSearch, FiHeart, FiClock } from "react-icons/fi";
import {
  BsFillPlayCircleFill,
  BsVolumeDownFill,
  BsThreeDots,
} from "react-icons/bs";
import { FiMusic } from "react-icons/fi";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import Layout from "../../components/layout";
import Heart from "../../components/heart";
import ActionPanel from "../../components/actionPanel";
import NavButtons from "../../components/navButtons";
import { getAlbumInfo, getPlaylistInfo } from "../../lib/api";
import { timeToString, renderArtists, formatDate } from "../../lib/helpers";
import { colorPicker } from "../../lib/color";

export default function PlaylistPage() {
  const [playlistPage, setPlaylistPage] = useState({});
  const [artistIds, setArtistIds] = useState([]);
  const [ids, setIds] = useState([]);
  const [albumIds, setAlbumIds] = useState([]);

  const [bgColor, setBgColor] = useState("");

  const router = useRouter();
  const imgRef = useRef();
  const { playlistId } = router.query;

  useEffect(() => {
    if (!playlistId) return;

    async function getPlaylist(id) {
      console.log("id", id);
      const playlist = await getPlaylistInfo(id);
      console.log("the playlist info", playlist);
      setPlaylistPage({
        description: playlist.description,
        followers: playlist.followers.total,
        image: playlist?.images[0]?.url || "",
        name: playlist.name,
        owner: playlist.owner.display_name,
        tracks: playlist.tracks.items,
        next: playlist.tracks.next,
        uri: playlist.uri,
      });
      setArtistIds(
        playlist.tracks.items.map((track) => {
          return track.track.artists[0].id;
        })
      );
      setAlbumIds(
        playlist.tracks.items.map((track) => {
          return track.track.album.id;
        })
      );
    }

    function fetchMorePlaylistItems() {
      if (playlistPage.next !== null) {
        fetch(playlistPage.next, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((response) => {
            console.log(response);
            setPlaylistPage((prev) => ({
              ...prev,
              tracks: prev.tracks.concat(response.items),
              next: response.next,
            }));
            if (response.next !== null) {
              fetchMorePlaylistItems();
            }
          });
      }
    }

    getPlaylist(playlistId).finally(() => fetchMorePlaylistItems());
  }, [router, playlistId]);

  useEffect(() => {
    if (playlistPage.image) {
      imgRef.current.onload = () => {
        console.log("my ref", imgRef.current);

        const dominantColor = colorPicker(imgRef.current);
        setBgColor(dominantColor);
      };
    } else {
      setBgColor("");
    }
  }, [playlistPage, bgColor]);

  return (
    <Layout>
      <Stack spacing={0}>
        <Stack
          px={10}
          pb={1}
          background={`-webkit-gradient(linear,left top,left bottom,from(transparent),to(rgba(0.1,0.3,0.5,.65))), ${bgColor}`}
        >
          <NavButtons />
          <Stack pt={4} pb={6} spacing={7} direction="row">
            {!playlistPage?.image ? (
              <Center bgColor="#282828" boxSize="232px">
                <FiMusic fontSize="70px" />
              </Center>
            ) : (
              <Image
                crossOrigin="Anonymous"
                ref={imgRef}
                boxSize="232px"
                alt="Album cover"
                src={playlistPage?.image || ""}
              ></Image>
            )}
            <Stack maxW="90%" spacing={0} alignSelf="end">
              <Text fontSize="sm" fontWeight={650} textTransform="uppercase">
                Playlist
              </Text>
              <Text
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                // minWidth="min-content"
                lineHeight="1.35"
                letterSpacing="tight"
                fontSize="92px"
                fontWeight={700}
              >
                {playlistPage?.name}
              </Text>
              <Text pt={4} pb={2} pl={1} fontSize="15px" color="whiteAlpha.700">
                {playlistPage?.description}
              </Text>
              <Stack pl={1} spacing={1} alignItems="center" direction="row">
                <Text px="2px" fontWeight={600}>
                  {playlistPage?.owner}
                </Text>
                <chakra.div
                  bgColor="white"
                  borderRadius="full"
                  width="4px"
                  height="4px"
                />
                {playlistPage?.followers ? (
                  <>
                    <Text px="2px" fontSize="sm" fontWeight={500}>
                      {playlistPage?.followers?.toLocaleString()} likes
                    </Text>
                    <chakra.div
                      bgColor="white"
                      borderRadius="full"
                      width="4px"
                      height="4px"
                    />
                  </>
                ) : (
                  <></>
                )}
                <Text px="2px" fontSize="sm" fontWeight={500}>
                  {playlistPage?.tracks?.length} songs
                </Text>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <Stack
          px={8}
          background={`linear-gradient(180deg, ${bgColor}1A 0%, ${bgColor}00 22%)`}
        >
          <ActionPanel uri={playlistPage.uri} />

          <Grid
            templateColumns="2.5fr 1.75fr 1fr 0.65fr"
            templateRows="20px"
            // autoRows="56px"

            gap={3}
          >
            <GridItem rowSpan={1} colSpan={1}>
              <Stack pl={4} direction="row" spacing={4}>
                <Text
                  textTransform="uppercase"
                  fontSize="14px"
                  fontWeight={400}
                  color="whiteAlpha.600"
                >
                  #
                </Text>
                <Text
                  textTransform="uppercase"
                  fontSize="13px"
                  letterSpacing="wider"
                  fontWeight={400}
                  color="whiteAlpha.600"
                >
                  Title
                </Text>
              </Stack>
            </GridItem>
            <GridItem rowSpan={1}>
              <Text
                textTransform="uppercase"
                fontSize="13px"
                letterSpacing="wider"
                fontWeight={400}
                color="whiteAlpha.600"
              >
                Album
              </Text>
            </GridItem>
            <GridItem rowSpan={1}>
              <Text
                textTransform="uppercase"
                fontSize="13px"
                letterSpacing="wider"
                fontWeight={400}
                color="whiteAlpha.600"
              >
                Date added
              </Text>
            </GridItem>
            <GridItem justifySelf="center" rowSpan={1}>
              <Icon color="whiteAlpha.600" as={FiClock} />
            </GridItem>
            <GridItem colSpan={4}>
              <Divider h="0.3px" borderColor="whiteAlpha.400" />
            </GridItem>
          </Grid>

          <Stack spacing={0}>
            {playlistPage?.tracks?.map((track, index) => {
              return (
                <Grid
                  key={index}
                  borderRadius="md"
                  py="2px"
                  _hover={{
                    textDecoration: "none",
                    bgColor: "hsla(0, 0%, 45%, .14)",
                  }}
                  alignItems="center"
                  templateColumns="2.5fr 1.75fr 1fr 0.65fr"
                  templateRows="54px" // do i need this property?
                  autoRows="54px"
                  gap={0}
                >
                  <GridItem rowSpan={1}>
                    <Stack
                      pl={4}
                      alignItems="center"
                      spacing={4}
                      direction="row"
                    >
                      <Text display="block" textAlign="right" w="max-content">
                        {index + 1}
                      </Text>

                      <Image
                        alt="track"
                        src={track?.track?.album?.images[0]?.url}
                        boxSize="40px"
                      />
                      <Stack maxW="75%" spacing={0}>
                        <Text
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                          fontSize="15.5px"
                          fontWeight={500}
                        >
                          {track?.track?.name}
                        </Text>
                        <Stack
                          direction="row"
                          spacing={1}
                          divider={
                            <span
                              style={{
                                color: "whiteAlpha.700",
                                fontSize: "14px",
                                marginInlineStart: "1px",
                                marginInlineEnd: "3px",
                              }}
                            >
                              ,
                            </span>
                          }
                        >
                          {track?.track?.artists?.map((artist, index) => {
                            return (
                              <NextLink
                                href={`/artist/${artist.id}`}
                                key={index}
                              >
                                <Link
                                  maxW="100%"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                  color="whiteAlpha.700"
                                  fontSize="14px"
                                >
                                  {artist.name}
                                </Link>
                              </NextLink>
                            );
                          })}
                        </Stack>
                      </Stack>
                    </Stack>
                  </GridItem>
                  <GridItem rowSpan={1}>
                    <NextLink href={`/album/${albumIds[index]}`}>
                      <Link color="whiteAlpha.700" fontSize="14px">
                        {track?.track?.album?.name}
                      </Link>
                    </NextLink>
                  </GridItem>
                  <GridItem rowSpan={1}>
                    <Text color="whiteAlpha.700" fontSize="14px">
                      {formatDate(track?.added_at)}
                    </Text>
                  </GridItem>
                  <GridItem justifySelf="center" rowSpan={1}>
                    <Text color="whiteAlpha.700" fontSize="14px">
                      {timeToString(track?.track?.duration_ms)}
                    </Text>
                  </GridItem>
                </Grid>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Layout>
  );
}
